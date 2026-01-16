import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Key,
  Webhook,
  Trash2,
} from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and application preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input defaultValue="Acme Inc." />
              </div>
              <Button variant="gradient">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates for agent actions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Document Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when documents are indexed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of your knowledge base activity
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API access tokens</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Production Key</p>
                    <Badge variant="ready">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    nx_prod_••••••••••••••••
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Reveal
                </Button>
              </div>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Generate New Key
              </Button>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Webhook className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect external services</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 16.09V13.5H7.5L12 6v4.5h3.09l-4.5 7.59z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Google Workspace</p>
                    <p className="text-sm text-muted-foreground">Calendar, Gmail, Drive</p>
                  </div>
                </div>
                <Badge variant="ready">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Slack</p>
                    <p className="text-sm text-muted-foreground">Notifications & commands</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Protect your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card variant="elevated" className="border-destructive/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
