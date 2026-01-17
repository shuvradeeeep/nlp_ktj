import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatMessage, ChatMessageType, Citation } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { PDFViewer } from "@/components/chat/PDFViewer";
import { CommandPalette } from "@/components/actions/CommandPalette";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRight, Sparkles, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, SourcePage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DocumentInfo {
  id: string;
  name: string;
  pages: number;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [showPDFViewer, setShowPDFViewer] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [pageImageData, setPageImageData] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load available documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoadingDocs(true);
        const response = await api.listDocuments();
        const readyDocs = response.documents
          .filter(doc => doc.status === 'ready')
          .map(doc => ({
            id: doc.id,
            name: doc.name,
            pages: doc.pages,
          }));
        setDocuments(readyDocs);

        // Check if a specific doc was requested via URL
        const docId = searchParams.get('doc');
        if (docId) {
          const doc = readyDocs.find(d => d.id === docId);
          if (doc) {
            setSelectedDocument(doc.name);
          }
        }

        // Add welcome message
        if (readyDocs.length > 0) {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: `Hello! I'm your AI assistant. I've analyzed ${readyDocs.length} document(s) in your knowledge base:\n\n${readyDocs.map(d => `• ${d.name} (${d.pages} pages)`).join('\n')}\n\nHow can I help you today?`,
            timestamp: new Date(),
          }]);
        } else {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your AI assistant. You haven't uploaded any documents yet. Please go to the Knowledge Base page to upload PDFs first, then come back to chat with them!",
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
        toast({
          title: "Connection Error",
          description: "Could not connect to the backend. Is it running?",
          variant: "destructive",
        });
        setMessages([{
          id: "error",
          role: "assistant",
          content: "⚠️ I couldn't connect to the backend server. Please make sure it's running on http://localhost:8000",
          timestamp: new Date(),
        }]);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    loadDocuments();
  }, [searchParams, toast]);

  const handleSend = async (content: string) => {
    if (documents.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload documents in the Knowledge Base first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the RAG API
      const response = await api.chat(content, 3);
      
      // Convert sources to citations
      const citations: Citation[] = response.sources.map((source, idx) => ({
        id: `c${idx}`,
        title: source.doc_name,
        page: source.page_num,
        docId: source.doc_id,
        imageData: source.page_image_base64 ? `data:image/png;base64,${source.page_image_base64}` : undefined,
      }));

      // Format answer with page references
      let formattedAnswer = response.answer;
      
      // Add source page info at the end if not already mentioned
      if (response.sources.length > 0) {
        const sourceInfo = response.sources.map(s => 
          `Page ${s.page_num} of "${s.doc_name}" (${(s.similarity_score * 100).toFixed(1)}% match)`
        ).join('\n');
        
        if (!formattedAnswer.toLowerCase().includes('page')) {
          formattedAnswer += `\n\n📄 **Sources:**\n${sourceInfo}`;
        }
      }

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formattedAnswer,
        citations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Auto-show first source in PDF viewer
      if (response.sources.length > 0) {
        const firstSource = response.sources[0];
        setSelectedDocument(firstSource.doc_name);
        setSelectedPage(firstSource.page_num);
        if (firstSource.page_image_base64) {
          setPageImageData(`data:image/png;base64,${firstSource.page_image_base64}`);
        }
        if (!showPDFViewer) {
          setShowPDFViewer(true);
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = async (citation: Citation & { docId?: string; imageData?: string }) => {
    setSelectedDocument(citation.title);
    setSelectedPage(citation.page || null);
    
    // If we have the image data from the response, use it
    if (citation.imageData) {
      setPageImageData(citation.imageData);
    } else if (citation.docId && citation.page) {
      // Otherwise fetch it
      try {
        const pageResponse = await api.getPageImage(citation.docId, citation.page);
        setPageImageData(pageResponse.image);
      } catch (error) {
        console.error("Failed to load page:", error);
      }
    }
    
    if (!showPDFViewer) {
      setShowPDFViewer(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-0px)] flex">
        {/* PDF Viewer Panel */}
        <div
          className={cn(
            "border-r border-border bg-card transition-all duration-300 overflow-hidden",
            showPDFViewer ? "w-1/2" : "w-0"
          )}
        >
          {showPDFViewer && (
            <PDFViewer
              documentName={selectedDocument || "No document selected"}
              pageNumber={selectedPage}
              pageImageData={pageImageData}
              onClose={() => setShowPDFViewer(false)}
            />
          )}
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Nexus AI Assistant</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoadingDocs ? "Loading..." : `${documents.length} document(s) indexed`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {documents.length === 0 && !isLoadingDocs && (
                <div className="flex items-center gap-2 text-xs text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>No documents</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPDFViewer(!showPDFViewer)}
              >
                {showPDFViewer ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCitationClick={handleCitationClick}
              />
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <Sparkles className="h-5 w-5 text-primary-foreground animate-pulse" />
                </div>
                <div className="flex flex-col gap-2 rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Searching documents and generating answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <ChatInput
              onSend={handleSend}
              onCommand={() => setShowCommandPalette(true)}
              disabled={isLoading || documents.length === 0}
              placeholder={documents.length === 0 ? "Upload documents first..." : "Ask a question about your documents..."}
            />
          </div>
        </div>
      </div>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />
    </DashboardLayout>
  );
}
