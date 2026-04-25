import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast as showToast } from "sonner";
import { Plus, Edit, Trash2, MessageSquare } from "lucide-react";

export function MessageTemplates() {

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templates, refetch } = trpc.communication.getTemplates.useQuery();
  const createTemplate = trpc.communication.createTemplate.useMutation();
  const updateTemplate = trpc.communication.updateTemplate.useMutation();
  const deleteTemplate = trpc.communication.deleteTemplate.useMutation();

  const [formData, setFormData] = useState({
    name: "",
    category: "general" as "attendance" | "fees" | "marks" | "general" | "festival",
    channel: "sms" as "sms" | "whatsapp" | "both",
    subject: "",
    content: "",
    variables: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          ...formData,
        });
        showToast.success("Template updated successfully");
      } else {
        await createTemplate.mutateAsync(formData);
        showToast.success("Template created successfully");
      }

      setIsCreateOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: "",
        category: "general",
        channel: "sms",
        subject: "",
        content: "",
        variables: "",
      });
      refetch();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      channel: template.channel,
      subject: template.subject || "",
      content: template.content,
      variables: template.variables || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteTemplate.mutateAsync({ id });
      showToast.success("Template deleted successfully");
      refetch();
    } catch (error) {
      showToast.error("Failed to delete template");
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      attendance: "bg-blue-100 text-blue-800",
      fees: "bg-green-100 text-green-800",
      marks: "bg-purple-100 text-purple-800",
      general: "bg-gray-100 text-gray-800",
      festival: "bg-yellow-100 text-yellow-800",
    };
    return colors[category] || colors.general;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">
              Create and manage reusable message templates for SMS and WhatsApp
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingTemplate(null);
              setFormData({
                name: "",
                category: "general",
                channel: "sms",
                subject: "",
                content: "",
                variables: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fee Payment Confirmation"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="fees">Fees</SelectItem>
                        <SelectItem value="marks">Marks</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="channel">Channel</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={(value: any) => setFormData({ ...formData, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Use {variableName} for dynamic content. E.g., Dear {parentName}, {studentName} was absent on {date}."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available variables: {"{parentName}"}, {"{studentName}"}, {"{className}"}, {"{date}"}, {"{amount}"}, {"{marks}"}, etc.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                    {editingTemplate ? "Update" : "Create"} Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {templates?.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadge(template.category)}`}>
                      {template.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      {template.channel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.content}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {templates?.length === 0 && (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first message template to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
