import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatMessage, ChatMessageType, Citation } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { PDFViewer } from "@/components/chat/PDFViewer";
import { CommandPalette } from "@/components/actions/CommandPalette";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const mockMessages: ChatMessageType[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI assistant. I've analyzed all 24 documents in your knowledge base. How can I help you today?",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: "2",
    role: "user",
    content: "What were the key findings from the Q4 financial report?",
    timestamp: new Date(Date.now() - 60000 * 4),
  },
  {
    id: "3",
    role: "assistant",
    content:
      "Based on the Q4 Financial Report, here are the key findings:\n\n1. **Revenue Growth**: Total revenue increased by 23% YoY, reaching $14.2M\n\n2. **Operating Margins**: Improved to 18.5%, up from 15.2% in Q3\n\n3. **Customer Acquisition**: Added 847 new enterprise customers\n\n4. **Cash Position**: Strong cash reserves of $42.3M with zero debt",
    citations: [
      { id: "c1", title: "Q4_Financial_Report.pdf", page: 4 },
      { id: "c2", title: "Q4_Financial_Report.pdf", page: 12 },
    ],
    timestamp: new Date(Date.now() - 60000 * 3),
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockMessages);
  const [showPDFViewer, setShowPDFViewer] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("Q4_Financial_Report.pdf");
  const [highlightedSection, setHighlightedSection] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1500));

    const aiMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "I've analyzed your query against the knowledge base. Based on the relevant documents, here's what I found...\n\nThe information you're looking for can be found in multiple sections across your documents.",
      citations: [
        { id: "c1", title: selectedDocument, page: 7 },
      ],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleCitationClick = (citation: Citation) => {
    setSelectedDocument(citation.title);
    setHighlightedSection(`Page ${citation.page}`);
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
              documentName={selectedDocument}
              highlightedSection={highlightedSection}
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
                  24 documents indexed
                </p>
              </div>
            </div>
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
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
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
              disabled={isLoading}
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
