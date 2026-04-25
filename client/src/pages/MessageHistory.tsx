import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

export function MessageHistory() {
  const [filters, setFilters] = useState({
    channel: undefined as "sms" | "whatsapp" | undefined,
    status: undefined as "sent" | "failed" | "pending" | undefined,
    recipientType: undefined as "parent" | "student" | "staff" | undefined,
  });

  const { data: messages } = trpc.communication.getMessages.useQuery({
    ...filters,
    limit: 100,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      sent: "default",
      failed: "destructive",
      pending: "secondary",
    };
    return variants[status] || "secondary";
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Message History</h1>
          <p className="text-muted-foreground">
            View all sent messages and their delivery status
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={filters.channel || "all"} onValueChange={(value) => setFilters({ ...filters, channel: value === "all" ? undefined : value as any })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || "all_status"} onValueChange={(value) => setFilters({ ...filters, status: value === "all_status" ? undefined : value as any })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.recipientType || "all_recipients"} onValueChange={(value) => setFilters({ ...filters, recipientType: value === "all_recipients" ? undefined : value as any })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Recipients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_recipients">All Recipients</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {messages?.map((message) => (
            <Card key={message.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(message.status)}
                    <div>
                      <p className="font-semibold">
                        {message.recipientName || "Unknown"} ({message.recipientPhone})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {message.recipientType} • {message.channel.toUpperCase()}
                      </p>
                    </div>
                    <Badge variant={getStatusBadge(message.status)}>
                      {message.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.sentAt
                      ? `Sent: ${new Date(message.sentAt).toLocaleString()}`
                      : `Created: ${new Date(message.createdAt).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {messages?.length === 0 && (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages found</h3>
              <p className="text-muted-foreground">
                Messages will appear here once you start sending them
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
