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
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  Edit2,
  LogIn,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteStatusBadge } from "../components/Badges";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type Customer,
  SiteStatus,
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useEmployees,
  useUpdateCustomer,
} from "../hooks/useQueries";
import { formatINR } from "../utils/format";

type CustomerFormData = {
  name: string;
  phone: string;
  address: string;
  systemSizeKW: string;
  totalAmount: string;
  amountReceived: string;
  siteStatus: SiteStatus;
  assignedEmployeeId: string;
};

const defaultFormData: CustomerFormData = {
  name: "",
  phone: "",
  address: "",
  systemSizeKW: "",
  totalAmount: "",
  amountReceived: "",
  siteStatus: SiteStatus.pending,
  assignedEmployeeId: "none",
};

export function CustomersPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: customers = [], isLoading } = useCustomers();
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SiteStatus>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormData>(defaultFormData);

  const remainingAmount = useMemo(() => {
    const total = Number.parseFloat(form.totalAmount) || 0;
    const received = Number.parseFloat(form.amountReceived) || 0;
    return Math.max(0, total - received);
  }, [form.totalAmount, form.amountReceived]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchesStatus =
        statusFilter === "all" || c.siteStatus === statusFilter;
      const matchesEmployee =
        employeeFilter === "all" ||
        (employeeFilter === "unassigned"
          ? !c.assignedEmployeeId
          : c.assignedEmployeeId?.toString() === employeeFilter);
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [customers, search, statusFilter, employeeFilter]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultFormData);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditTarget(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      systemSizeKW: customer.systemSizeKW.toString(),
      totalAmount: customer.totalAmount.toString(),
      amountReceived: customer.amountReceived.toString(),
      siteStatus: customer.siteStatus,
      assignedEmployeeId: customer.assignedEmployeeId?.toString() ?? "none",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      systemSizeKW: Number.parseFloat(form.systemSizeKW) || 0,
      totalAmount: Number.parseFloat(form.totalAmount) || 0,
      amountReceived: Number.parseFloat(form.amountReceived) || 0,
      siteStatus: form.siteStatus,
      assignedEmployeeId:
        form.assignedEmployeeId && form.assignedEmployeeId !== "none"
          ? BigInt(form.assignedEmployeeId)
          : null,
    };
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...payload });
        toast.success("Customer updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Customer added successfully");
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
      toast.success("Customer deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  const getEmployeeName = (id?: bigint) => {
    if (!id) return "—";
    const emp = employees.find((e) => e.id === id);
    return emp?.name ?? "—";
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {customers.length} total customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="customer.open_modal_button"
          onClick={openAdd}
          disabled={!isLoggedIn}
          title={!isLoggedIn ? "Please log in to add customers" : undefined}
          className="gap-2 bg-amber-500 hover:bg-amber-400 text-navy-deep font-semibold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Auth warning */}
      {!isLoggedIn && (
        <div
          data-ocid="customer.auth.error_state"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl px-4 py-3 border border-amber-500/30 bg-amber-500/10"
        >
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300 font-medium">
              Please log in to add, edit, or delete customers.
            </p>
          </div>
          <button
            type="button"
            data-ocid="customer.auth.login.button"
            onClick={login}
            disabled={isLoggingIn}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-navy-deep transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="h-3.5 w-3.5" />
            {isLoggingIn ? "Logging in…" : "Login"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="customer.search_input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-amber-500/50"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger
            data-ocid="customer.status.select"
            className="w-full sm:w-44 bg-white/5 border-white/10"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={SiteStatus.pending}>Pending</SelectItem>
            <SelectItem value={SiteStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={SiteStatus.completed}>Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={employeeFilter}
          onValueChange={(v) => setEmployeeFilter(v)}
        >
          <SelectTrigger
            data-ocid="customer.employee.select"
            className="w-full sm:w-48 bg-white/5 border-white/10"
          >
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="customer.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="customer.empty_state"
          className="glass-card rounded-xl py-16 text-center"
        >
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No customers found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Add your first customer to get started"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="glass-card rounded-xl overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="customer.table">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      System
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Received
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer, idx) => (
                    <tr
                      key={customer.id.toString()}
                      data-ocid={`customer.row.${idx + 1}`}
                      className="border-b border-white/5 table-row-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {customer.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.systemSizeKW} KW
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {formatINR(customer.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-emerald-400">
                        {formatINR(customer.amountReceived)}
                      </td>
                      <td className="px-4 py-3 text-amber-400">
                        {formatINR(
                          Math.max(
                            0,
                            customer.totalAmount - customer.amountReceived,
                          ),
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SiteStatusBadge status={customer.siteStatus} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {getEmployeeName(customer.assignedEmployeeId)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            data-ocid={`customer.edit_button.${idx + 1}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(customer)}
                            className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            data-ocid={`customer.delete_button.${idx + 1}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(customer)}
                            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((customer, idx) => (
              <div
                key={customer.id.toString()}
                data-ocid={`customer.item.${idx + 1}`}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  </div>
                  <SiteStatusBadge status={customer.siteStatus} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">System</p>
                    <p className="font-medium text-foreground mt-0.5">
                      {customer.systemSizeKW} KW
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Received</p>
                    <p className="font-medium text-emerald-400 mt-0.5">
                      {formatINR(customer.amountReceived)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="font-medium text-amber-400 mt-0.5">
                      {formatINR(
                        Math.max(
                          0,
                          customer.totalAmount - customer.amountReceived,
                        ),
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Employee:{" "}
                    <span className="text-foreground">
                      {getEmployeeName(customer.assignedEmployeeId)}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`customer.mobile.edit_button.${idx + 1}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(customer)}
                      className="h-8 gap-1.5 text-xs hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      data-ocid={`customer.mobile.delete_button.${idx + 1}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(customer)}
                      className="h-8 gap-1.5 text-xs hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="customer.dialog"
          className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editTarget ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editTarget
                ? "Update customer information"
                : "Fill in the details to add a new customer"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Customer Name
                </Label>
                <Input
                  id="name"
                  data-ocid="customer.name.input"
                  required
                  placeholder="Ramesh Kumar"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  data-ocid="customer.phone.input"
                  required
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="address"
                className="text-xs font-medium text-muted-foreground uppercase"
              >
                Address
              </Label>
              <Textarea
                id="address"
                data-ocid="customer.address.textarea"
                placeholder="Village / Street, City, Jodhpur"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="bg-white/5 border-white/10 focus:border-amber-500/50 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="systemSize"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  System Size (KW)
                </Label>
                <Input
                  id="systemSize"
                  data-ocid="customer.system_size.input"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5"
                  value={form.systemSizeKW}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, systemSizeKW: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="totalAmount"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Total Amount (₹)
                </Label>
                <Input
                  id="totalAmount"
                  data-ocid="customer.total_amount.input"
                  type="number"
                  min="0"
                  placeholder="250000"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, totalAmount: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="amountReceived"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Amount Received (₹)
                </Label>
                <Input
                  id="amountReceived"
                  data-ocid="customer.amount_received.input"
                  type="number"
                  min="0"
                  placeholder="100000"
                  value={form.amountReceived}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amountReceived: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Remaining Amount (₹)
                </Label>
                <div className="h-10 px-3 flex items-center rounded-lg bg-white/3 border border-white/5 text-amber-400 font-medium text-sm">
                  {formatINR(remainingAmount)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Site Status
                </Label>
                <Select
                  value={form.siteStatus}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, siteStatus: v as SiteStatus }))
                  }
                >
                  <SelectTrigger
                    data-ocid="customer.site_status.select"
                    className="bg-white/5 border-white/10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SiteStatus.pending}>Pending</SelectItem>
                    <SelectItem value={SiteStatus.inProgress}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={SiteStatus.completed}>
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Assigned Employee
                </Label>
                <Select
                  value={form.assignedEmployeeId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, assignedEmployeeId: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="customer.assigned_employee.select"
                    className="bg-white/5 border-white/10"
                  >
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem
                        key={emp.id.toString()}
                        value={emp.id.toString()}
                      >
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                data-ocid="customer.cancel_button"
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                data-ocid="customer.submit_button"
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
                  "Update Customer"
                ) : (
                  "Add Customer"
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
          data-ocid="customer.delete.dialog"
          className="bg-card border-white/10"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="customer.delete.cancel_button"
              className="hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="customer.delete.confirm_button"
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
