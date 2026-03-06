import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Phone, Plus, Trash2, UserCheck } from "lucide-react";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { RoleBadge } from "../components/Badges";
import {
  type Employee,
  EmployeeRole,
  useCreateEmployee,
  useCustomers,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
} from "../hooks/useQueries";

const ROLE_OPTIONS = [
  { value: EmployeeRole.telecaller, label: "Telecaller" },
  { value: EmployeeRole.marketingStaff, label: "Marketing Staff" },
  { value: EmployeeRole.fieldWorker, label: "Field Worker" },
  { value: EmployeeRole.manager, label: "Manager" },
  { value: EmployeeRole.marketManager, label: "Market Manager" },
];

type EmployeeFormData = {
  name: string;
  phone: string;
  role: EmployeeRole;
};

const defaultFormData: EmployeeFormData = {
  name: "",
  phone: "",
  role: EmployeeRole.telecaller,
};

export function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: customers = [] } = useCustomers();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(defaultFormData);

  const getAssignedCount = (empId: bigint) =>
    customers.filter((c) => c.assignedEmployeeId === empId).length;

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultFormData);
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({ name: emp.name, phone: emp.phone, role: emp.role });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...form });
        toast.success("Employee updated successfully");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Employee added successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Employee deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Employees
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {employees.length} team member{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="employee.open_modal_button"
          onClick={openAdd}
          className="gap-2 bg-amber-500 hover:bg-amber-400 text-navy-deep font-semibold shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="employee.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div
          data-ocid="employee.empty_state"
          className="glass-card rounded-xl py-16 text-center"
        >
          <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No employees yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first team member to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, idx) => {
            const assignedCount = getAssignedCount(emp.id);
            return (
              <div
                key={emp.id.toString()}
                data-ocid={`employee.item.${idx + 1}`}
                className="glass-card rounded-xl p-5 animate-fade-in-up group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Avatar + Name row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold font-display shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.75 0.18 62 / 30%), oklch(0.6 0.15 55 / 20%))",
                        border: "1px solid oklch(0.75 0.18 62 / 25%)",
                        color: "oklch(0.85 0.18 70)",
                      }}
                    >
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {emp.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <div className="mb-4">
                  <RoleBadge role={emp.role} />
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center justify-between text-xs py-2.5 px-3 rounded-lg mb-4"
                  style={{
                    background: "oklch(0.15 0.05 258 / 60%)",
                    border: "1px solid oklch(0.3 0.07 255 / 15%)",
                  }}
                >
                  <span className="text-muted-foreground">
                    Assigned Customers
                  </span>
                  <span className="font-bold text-amber-300">
                    {assignedCount}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    data-ocid={`employee.edit_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(emp)}
                    className="flex-1 gap-1.5 text-xs hover:bg-blue-500/10 hover:text-blue-400 h-8"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    data-ocid={`employee.delete_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(emp)}
                    className="flex-1 gap-1.5 text-xs hover:bg-red-500/10 hover:text-red-400 h-8"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="employee.dialog"
          className="bg-card border-white/10 max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editTarget ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editTarget ? "Update employee details" : "Add a new team member"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="empName"
                className="text-xs font-medium text-muted-foreground uppercase"
              >
                Name
              </Label>
              <Input
                id="empName"
                data-ocid="employee.name.input"
                required
                placeholder="Suresh Sharma"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="bg-white/5 border-white/10 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="empPhone"
                className="text-xs font-medium text-muted-foreground uppercase"
              >
                Phone
              </Label>
              <Input
                id="empPhone"
                data-ocid="employee.phone.input"
                required
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="bg-white/5 border-white/10 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Role
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as EmployeeRole }))
                }
              >
                <SelectTrigger
                  data-ocid="employee.role.select"
                  className="bg-white/5 border-white/10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                data-ocid="employee.cancel_button"
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                data-ocid="employee.submit_button"
                type="submit"
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-navy-deep font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editTarget ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="employee.delete.dialog"
          className="bg-card border-white/10"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="employee.delete.cancel_button"
              className="hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="employee.delete.confirm_button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
