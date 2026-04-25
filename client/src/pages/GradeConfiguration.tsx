import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "../components/ui/textarea";

export default function GradeConfiguration() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);

  const { data: gradeScales, refetch } = trpc.grades.getGradeScales.useQuery();
  const createGrade = trpc.grades.createGradeScale.useMutation({
    onSuccess: () => {
      toast.success("Grade scale created successfully");
      refetch();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to create grade scale: ${error.message}`);
    },
  });

  const updateGrade = trpc.grades.updateGradeScale.useMutation({
    onSuccess: () => {
      toast.success("Grade scale updated successfully");
      refetch();
      setShowDialog(false);
      setEditingGrade(null);
    },
    onError: (error) => {
      toast.error(`Failed to update grade scale: ${error.message}`);
    },
  });

  const deleteGrade = trpc.grades.deleteGradeScale.useMutation({
    onSuccess: () => {
      toast.success("Grade scale deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete grade scale: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      gradeName: formData.get("gradeName") as string,
      minPercentage: parseInt(formData.get("minPercentage") as string),
      maxPercentage: parseInt(formData.get("maxPercentage") as string),
      gradePoints: parseInt(formData.get("gradePoints") as string),
      description: formData.get("description") as string,
      displayOrder: parseInt(formData.get("displayOrder") as string),
    };

    if (editingGrade) {
      updateGrade.mutate({ id: editingGrade.id, ...data });
    } else {
      createGrade.mutate(data);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this grade scale?")) {
      deleteGrade.mutate({ id });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingGrade(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Grade Configuration</h1>
        <p className="text-muted-foreground">
          Configure grade scales for automatic grade calculation
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grade Scales</CardTitle>
              <CardDescription>
                Define grade ranges and their corresponding grade points
              </CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Grade Scale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGrade ? "Edit Grade Scale" : "Add Grade Scale"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGrade
                      ? "Update the grade scale configuration"
                      : "Create a new grade scale for automatic grading"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradeName">Grade Name</Label>
                    <Input
                      id="gradeName"
                      name="gradeName"
                      placeholder="e.g., A+, A, B+"
                      defaultValue={editingGrade?.gradeName}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minPercentage">Min Percentage</Label>
                      <Input
                        id="minPercentage"
                        name="minPercentage"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editingGrade?.minPercentage}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxPercentage">Max Percentage</Label>
                      <Input
                        id="maxPercentage"
                        name="maxPercentage"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editingGrade?.maxPercentage}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gradePoints">Grade Points</Label>
                      <Input
                        id="gradePoints"
                        name="gradePoints"
                        type="number"
                        min="0"
                        defaultValue={editingGrade?.gradePoints}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        name="displayOrder"
                        type="number"
                        min="1"
                        defaultValue={editingGrade?.displayOrder || (gradeScales?.length || 0) + 1}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="e.g., Outstanding performance"
                      defaultValue={editingGrade?.description}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingGrade ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {gradeScales && gradeScales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Percentage Range</TableHead>
                  <TableHead>Grade Points</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeScales.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-bold text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {grade.gradeName}
                    </TableCell>
                    <TableCell>
                      {grade.minPercentage}% - {grade.maxPercentage}%
                    </TableCell>
                    <TableCell>{grade.gradePoints}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {grade.description || "-"}
                    </TableCell>
                    <TableCell>{grade.displayOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(grade)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(grade.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No grade scales configured yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add grade scales to enable automatic grade calculation
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Grade Scale
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
