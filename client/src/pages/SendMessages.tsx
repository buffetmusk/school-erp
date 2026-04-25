import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast as showToast } from "sonner";
import { Send, Users, User } from "lucide-react";

export function SendMessages() {
  const [individualForm, setIndividualForm] = useState({
    phone: "",
    name: "",
    message: "",
    channel: "sms" as "sms" | "whatsapp",
  });

  const [bulkForm, setBulkForm] = useState({
    recipientType: "all_parents" as "all_parents" | "specific_class",
    classId: undefined as number | undefined,
    templateId: undefined as number | undefined,
    channel: "sms" as "sms" | "whatsapp",
    customMessage: "",
  });

  const { data: templates } = trpc.communication.getTemplates.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();
  
  const sendIndividualMessage = trpc.communication.sendMessage.useMutation();
  const sendBulkMessage = trpc.communication.sendBulkMessage.useMutation();

  const handleSendIndividual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!individualForm.phone || !individualForm.message) {
      showToast.error("Please fill all required fields");
      return;
    }

    try {
      await sendIndividualMessage.mutateAsync({
        recipientType: "parent",
        recipientPhone: individualForm.phone,
        recipientName: individualForm.name || undefined,
        content: individualForm.message,
        channel: individualForm.channel,
      });

      showToast.success("Message sent successfully");
      setIndividualForm({
        phone: "",
        name: "",
        message: "",
        channel: "sms",
      });
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkForm.recipientType === "specific_class" && !bulkForm.classId) {
      showToast.error("Please select a class");
      return;
    }

    if (!bulkForm.templateId && !bulkForm.customMessage) {
      showToast.error("Please select a template or enter a custom message");
      return;
    }

    try {
      await sendBulkMessage.mutateAsync({
        recipientType: bulkForm.recipientType,
        classId: bulkForm.classId,
        templateId: bulkForm.templateId,
        content: bulkForm.customMessage || "",
        channel: bulkForm.channel,
      });

      showToast.success("Bulk messages sent successfully");
      setBulkForm({
        recipientType: "all_parents",
        classId: undefined,
        templateId: undefined,
        channel: "sms",
        customMessage: "",
      });
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to send bulk messages");
    }
  };

  const selectedTemplate = templates?.find(t => t.id === bulkForm.templateId);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Send Messages</h1>
          <p className="text-muted-foreground">
            Send SMS or WhatsApp messages to parents, students, or staff
          </p>
        </div>

        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList>
            <TabsTrigger value="individual">
              <User className="mr-2 h-4 w-4" />
              Individual Message
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Users className="mr-2 h-4 w-4" />
              Bulk Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <Card className="p-6">
              <form onSubmit={handleSendIndividual} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={individualForm.phone}
                      onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Recipient Name (Optional)</Label>
                    <Input
                      id="name"
                      value={individualForm.name}
                      onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select
                    value={individualForm.channel}
                    onValueChange={(value: any) => setIndividualForm({ ...individualForm, channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={individualForm.message}
                    onChange={(e) => setIndividualForm({ ...individualForm, message: e.target.value })}
                    placeholder="Type your message here..."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {individualForm.message.length} characters
                  </p>
                </div>

                <Button type="submit" disabled={sendIndividualMessage.isPending}>
                  <Send className="mr-2 h-4 w-4" />
                  {sendIndividualMessage.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="p-6">
              <form onSubmit={handleSendBulk} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientType">Recipients</Label>
                    <Select
                      value={bulkForm.recipientType}
                      onValueChange={(value: any) => setBulkForm({ ...bulkForm, recipientType: value, classId: undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_parents">All Parents</SelectItem>
                        <SelectItem value="specific_class">Specific Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bulkForm.recipientType === "specific_class" && (
                    <div>
                      <Label htmlFor="classId">Select Class</Label>
                      <Select
                        value={bulkForm.classId?.toString()}
                        onValueChange={(value) => setBulkForm({ ...bulkForm, classId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="channel">Channel</Label>
                    <Select
                      value={bulkForm.channel}
                      onValueChange={(value: any) => setBulkForm({ ...bulkForm, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="templateId">Message Template (Optional)</Label>
                  <Select
                    value={bulkForm.templateId?.toString()}
                    onValueChange={(value) => setBulkForm({ ...bulkForm, templateId: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template or write custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Custom Message)</SelectItem>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Preview: {selectedTemplate.content}
                    </p>
                  )}
                </div>

                {!bulkForm.templateId && (
                  <div>
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea
                      id="customMessage"
                      value={bulkForm.customMessage}
                      onChange={(e) => setBulkForm({ ...bulkForm, customMessage: e.target.value })}
                      placeholder="Type your message here..."
                      rows={6}
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will send messages to{" "}
                    {bulkForm.recipientType === "all_parents" && "all parents"}
                    {bulkForm.recipientType === "specific_class" && bulkForm.classId && "parents of students in the selected class"}
                    {bulkForm.recipientType === "specific_class" && !bulkForm.classId && "parents of students in a specific class (select class above)"}
                    . Please review before sending.
                  </p>
                </div>

                <Button type="submit" disabled={sendBulkMessage.isPending}>
                  <Send className="mr-2 h-4 w-4" />
                  {sendBulkMessage.isPending ? "Sending..." : "Send Bulk Messages"}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
