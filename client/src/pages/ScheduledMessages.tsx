import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast as showToast } from "sonner";
import { Plus, Calendar, Clock, Trash2, Power, PowerOff } from "lucide-react";
import { Badge } from "../components/ui/badge";

export function ScheduledMessages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    templateId: undefined as number | undefined,
    recipientType: "all_parents" as "all_parents" | "specific_class",
    classId: undefined as number | undefined,
    channel: "sms" as "sms" | "whatsapp" | "both",
    scheduleType: "once" as "once" | "daily" | "weekly" | "monthly" | "yearly",
    scheduleDate: "",
    scheduleTime: "09:00",
    scheduleDayOfWeek: undefined as number | undefined,
    scheduleDayOfMonth: undefined as number | undefined,
  });

  const { data: scheduledMessages, refetch } = trpc.communication.getScheduledMessages.useQuery();
  const { data: templates } = trpc.communication.getTemplates.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();

  const createScheduledMessage = trpc.communication.createScheduledMessage.useMutation();
  const updateScheduledMessage = trpc.communication.updateScheduledMessage.useMutation();
  const deleteScheduledMessage = trpc.communication.deleteScheduledMessage.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.templateId) {
      showToast.error("Please fill all required fields");
      return;
    }

    if (formData.scheduleType === "once" && !formData.scheduleDate) {
      showToast.error("Please select a date for one-time schedule");
      return;
    }

    if (formData.scheduleType === "weekly" && formData.scheduleDayOfWeek === undefined) {
      showToast.error("Please select a day of week");
      return;
    }

    if (formData.scheduleType === "monthly" && !formData.scheduleDayOfMonth) {
      showToast.error("Please select a day of month");
      return;
    }

    try {
      await createScheduledMessage.mutateAsync({
        ...formData,
        templateId: formData.templateId!,
        scheduleDate: formData.scheduleDate ? new Date(formData.scheduleDate) : undefined,
      });

      showToast.success("Scheduled message created successfully");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        templateId: undefined,
        recipientType: "all_parents",
        classId: undefined,
        channel: "sms",
        scheduleType: "once",
        scheduleDate: "",
        scheduleTime: "09:00",
        scheduleDayOfWeek: undefined,
        scheduleDayOfMonth: undefined,
      });
      refetch();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to create scheduled message");
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateScheduledMessage.mutateAsync({ id, isActive: currentStatus ? 0 : 1 });
      showToast.success(`Scheduled message ${!currentStatus ? "activated" : "deactivated"}`);
      refetch();
    } catch (error) {
      showToast.error("Failed to toggle scheduled message");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this scheduled message?")) return;

    try {
      await deleteScheduledMessage.mutateAsync({ id });
      showToast.success("Scheduled message deleted successfully");
      refetch();
    } catch (error) {
      showToast.error("Failed to delete scheduled message");
    }
  };

  const getScheduleDescription = (msg: any) => {
    switch (msg.scheduleType) {
      case "once":
        return `Once on ${new Date(msg.scheduleDate).toLocaleDateString()} at ${msg.scheduleTime}`;
      case "daily":
        return `Daily at ${msg.scheduleTime}`;
      case "weekly":
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `Weekly on ${days[msg.scheduleDayOfWeek]} at ${msg.scheduleTime}`;
      case "monthly":
        return `Monthly on day ${msg.scheduleDayOfMonth} at ${msg.scheduleTime}`;
      case "yearly":
        return `Yearly on ${new Date(msg.scheduleDate).toLocaleDateString()} at ${msg.scheduleTime}`;
      default:
        return "Unknown schedule";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Scheduled Messages</h1>
            <p className="text-muted-foreground">
              Automate festival greetings and recurring notifications
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Message</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Diwali Greetings 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="templateId">Message Template</Label>
                  <Select
                    value={formData.templateId?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, templateId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientType">Recipients</Label>
                    <Select
                      value={formData.recipientType}
                      onValueChange={(value: any) => setFormData({ ...formData, recipientType: value, classId: undefined })}
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

                  {formData.recipientType === "specific_class" && (
                    <div>
                      <Label htmlFor="classId">Select Class</Label>
                      <Select
                        value={formData.classId?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, classId: parseInt(value) })}
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
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    value={formData.scheduleType}
                    onValueChange={(value: any) => setFormData({ ...formData, scheduleType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once (Specific Date)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.scheduleType === "once" || formData.scheduleType === "yearly") && (
                  <div>
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                      required
                    />
                  </div>
                )}

                {formData.scheduleType === "weekly" && (
                  <div>
                    <Label htmlFor="scheduleDayOfWeek">Day of Week</Label>
                    <Select
                      value={formData.scheduleDayOfWeek?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, scheduleDayOfWeek: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.scheduleType === "monthly" && (
                  <div>
                    <Label htmlFor="scheduleDayOfMonth">Day of Month</Label>
                    <Input
                      id="scheduleDayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.scheduleDayOfMonth || ""}
                      onChange={(e) => setFormData({ ...formData, scheduleDayOfMonth: parseInt(e.target.value) })}
                      placeholder="1-31"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="scheduleTime">Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createScheduledMessage.isPending}>
                    Schedule Message
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {scheduledMessages?.map((msg) => (
            <Card key={msg.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{msg.name}</h3>
                    <Badge variant={msg.isActive ? "default" : "secondary"}>
                      {msg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <Clock className="inline h-4 w-4 mr-1" />
                      {getScheduleDescription(msg)}
                    </p>
                    <p>Channel: {msg.channel}</p>
                    <p>Recipients: {msg.recipientType.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(msg.id, msg.isActive === 1)}
                  >
                    {msg.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(msg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {scheduledMessages?.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scheduled messages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create automated messages for festivals and recurring notifications
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Message
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
