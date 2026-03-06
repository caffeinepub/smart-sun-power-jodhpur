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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskStatusBadge } from "../components/Badges";
import {
  type Task,
  TaskStatus,
  useCreateTask,
  useDeleteTask,
  useEmployees,
  useTasks,
  useUpdateTask,
} from "../hooks/useQueries";
import { formatDate, todayStr } from "../utils/format";

type TaskFormData = {
  title: string;
  description: string;
  assignedEmployeeId: string;
  status: TaskStatus;
  dueDate: string;
};

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  assignedEmployeeId: "none",
  status: TaskStatus.pending,
  dueDate: todayStr(),
};

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [tab, setTab] = useState<"all" | "pending" | "completed">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(defaultFormData);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (tab === "pending") return t.status === TaskStatus.pending;
        if (tab === "completed") return t.status === TaskStatus.completed;
        return true;
      })
      .sort((a, b) => {
        // Sort by due date desc, then by creation desc
        if (a.dueDate !== b.dueDate) return b.dueDate.localeCompare(a.dueDate);
        return Number(b.createdAt) - Number(a.createdAt);
      });
  }, [tasks, tab]);

  const getEmployeeName = (id?: bigint) => {
    if (!id) return null;
    return employees.find((e) => e.id === id)?.name ?? null;
  };

  const toggleStatus = async (task: Task) => {
    const newStatus =
      task.status === TaskStatus.pending
        ? TaskStatus.completed
        : TaskStatus.pending;
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedEmployeeId: task.assignedEmployeeId ?? null,
        status: newStatus,
        dueDate: task.dueDate,
      });
      toast.success(
        newStatus === TaskStatus.completed
          ? "Task completed!"
          : "Task marked pending",
      );
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        assignedEmployeeId:
          form.assignedEmployeeId && form.assignedEmployeeId !== "none"
            ? BigInt(form.assignedEmployeeId)
            : null,
        status: form.status,
        dueDate: form.dueDate,
      });
      toast.success("Task added successfully");
      setDialogOpen(false);
      setForm(defaultFormData);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Task deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const pendingCount = tasks.filter(
    (t) => t.status === TaskStatus.pending,
  ).length;
  const completedCount = tasks.filter(
    (t) => t.status === TaskStatus.completed,
  ).length;

  const isToday = (dateStr: string) => dateStr === todayStr();
  const isOverdue = (dateStr: string) => dateStr < todayStr();

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        <Button
          data-ocid="task.open_modal_button"
          onClick={() => {
            setForm(defaultFormData);
            setDialogOpen(true);
          }}
          className="gap-2 bg-amber-500 hover:bg-amber-400 text-navy-deep font-semibold shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            data-ocid="task.all.tab"
            value="all"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            All ({tasks.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="task.pending.tab"
            value="pending"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="task.completed.tab"
            value="completed"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
          >
            Completed ({completedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="task.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="task.empty_state"
          className="glass-card rounded-xl py-16 text-center"
        >
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No tasks found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {tab !== "all"
              ? `No ${tab} tasks`
              : "Add your first task to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, idx) => {
            const empName = getEmployeeName(task.assignedEmployeeId);
            const overdue =
              task.status === TaskStatus.pending && isOverdue(task.dueDate);
            const dueToday = isToday(task.dueDate);
            const isCompleted = task.status === TaskStatus.completed;

            return (
              <div
                key={task.id.toString()}
                data-ocid={`task.item.${idx + 1}`}
                className={`glass-card rounded-xl p-4 transition-all duration-200 animate-fade-in-up ${
                  isCompleted ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Status toggle */}
                  <button
                    type="button"
                    data-ocid={`task.toggle.${idx + 1}`}
                    onClick={() => toggleStatus(task)}
                    disabled={updateMutation.isPending}
                    className="mt-0.5 shrink-0 transition-all duration-200 hover:scale-110 disabled:opacity-50 cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-amber-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 justify-between">
                      <p
                        className={`font-semibold text-sm ${
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <TaskStatusBadge status={task.status} />
                        <Button
                          data-ocid={`task.delete_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(task)}
                          className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Due date */}
                      <div className="flex items-center gap-1">
                        <Calendar
                          className={`h-3 w-3 shrink-0 ${
                            overdue
                              ? "text-red-400"
                              : dueToday
                                ? "text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            overdue
                              ? "text-red-400 font-medium"
                              : dueToday
                                ? "text-amber-400 font-medium"
                                : "text-muted-foreground"
                          }`}
                        >
                          {dueToday ? "Today" : overdue ? "Overdue" : ""}{" "}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>

                      {/* Assigned employee */}
                      {empName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {empName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="task.dialog"
          className="bg-card border-white/10 max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Add New Task
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Create a new task and assign it to a team member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="taskTitle"
                className="text-xs font-medium text-muted-foreground uppercase"
              >
                Title
              </Label>
              <Input
                id="taskTitle"
                data-ocid="task.title.input"
                required
                placeholder="Site inspection for Kumar residence"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-white/5 border-white/10 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="taskDesc"
                className="text-xs font-medium text-muted-foreground uppercase"
              >
                Description
              </Label>
              <Textarea
                id="taskDesc"
                data-ocid="task.description.textarea"
                placeholder="Additional details about the task..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-white/5 border-white/10 focus:border-amber-500/50 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="taskDueDate"
                  className="text-xs font-medium text-muted-foreground uppercase"
                >
                  Due Date
                </Label>
                <Input
                  id="taskDueDate"
                  data-ocid="task.due_date.input"
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as TaskStatus }))
                  }
                >
                  <SelectTrigger
                    data-ocid="task.status.select"
                    className="bg-white/5 border-white/10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.pending}>Pending</SelectItem>
                    <SelectItem value={TaskStatus.completed}>
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Assign to Employee
              </Label>
              <Select
                value={form.assignedEmployeeId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, assignedEmployeeId: v }))
                }
              >
                <SelectTrigger
                  data-ocid="task.assigned_employee.select"
                  className="bg-white/5 border-white/10"
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
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
            <DialogFooter className="pt-2">
              <Button
                data-ocid="task.cancel_button"
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                data-ocid="task.submit_button"
                type="submit"
                disabled={createMutation.isPending}
                className="bg-amber-500 hover:bg-amber-400 text-navy-deep font-semibold"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Task"
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
          data-ocid="task.delete.dialog"
          className="bg-card border-white/10"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.title}</strong>? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="task.delete.cancel_button"
              className="hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="task.delete.confirm_button"
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
