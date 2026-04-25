import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FeeStructuresList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    academicYearId: "",
    classId: "",
  });
  const [components, setComponents] = useState<Array<{ feeHeadId: string; amount: string }>>([
    { feeHeadId: "", amount: "" },
  ]);

  const { data: structures, isLoading, refetch } = trpc.fees.listStructures.useQuery({});
  const { data: academicYears } = trpc.masterData.academicYears.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: feeHeads } = trpc.masterData.feeHeads.useQuery();
  const createStructure = trpc.fees.createStructure.useMutation();

  const handleAddComponent = () => {
    setComponents([...components, { feeHeadId: "", amount: "" }]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index: number, field: string, value: string) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validComponents = components.filter(
        (c) => c.feeHeadId && c.amount && parseFloat(c.amount) > 0
      );

      if (validComponents.length === 0) {
        toast.error("Please add at least one fee component");
        return;
      }

      await createStructure.mutateAsync({
        name: formData.name,
        academicYearId: parseInt(formData.academicYearId),
        classId: parseInt(formData.classId),
        components: validComponents.map((c) => ({
          feeHeadId: parseInt(c.feeHeadId),
          amount: parseFloat(c.amount),
        })),
      });

      toast.success("Fee structure created successfully");
      setDialogOpen(false);
      setFormData({ name: "", academicYearId: "", classId: "" });
      setComponents([{ feeHeadId: "", amount: "" }]);
      refetch();
    } catch (error) {
      toast.error("Failed to create fee structure");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Structures</h1>
          <p className="text-muted-foreground mt-1">Configure fee structures for different classes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Fee Structure</DialogTitle>
                <DialogDescription>
                  Define a new fee structure with multiple components.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Structure Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Grade 5 Fees 2026-27"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year *</Label>
                    <Select
                      value={formData.academicYearId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, academicYearId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears?.map((year: any) => (
                          <SelectItem key={year.id} value={year.id.toString()}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Fee Components *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Component
                    </Button>
                  </div>
                  {components.map((component, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Select
                          value={component.feeHeadId}
                          onValueChange={(value) =>
                            handleComponentChange(index, "feeHeadId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee head" />
                          </SelectTrigger>
                          <SelectContent>
                            {feeHeads?.map((head: any) => (
                              <SelectItem key={head.id} value={head.id.toString()}>
                                {head.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32 space-y-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={component.amount}
                          onChange={(e) =>
                            handleComponentChange(index, "amount", e.target.value)
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {components.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveComponent(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStructure.isPending}>
                  {createStructure.isPending ? "Creating..." : "Create Structure"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fee Structures</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading fee structures...</p>
          ) : structures && structures.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((structure: any) => (
                  <TableRow key={structure.id}>
                    <TableCell className="font-medium">{structure.name}</TableCell>
                    <TableCell>{structure.className}</TableCell>
                    <TableCell>{structure.academicYear}</TableCell>
                    <TableCell>₹{structure.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No fee structures found. Create your first structure to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
