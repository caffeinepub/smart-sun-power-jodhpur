import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ListChecks,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { SunLogo } from "../components/SunLogo";
import { useDashboardStats } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  glowColor: string;
  loading?: boolean;
  index: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  glowColor,
  loading,
  index,
}: StatCardProps) {
  return (
    <div
      className="glass-card stat-card rounded-xl p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
      data-ocid={`dashboard.stat.card.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/10" />
          ) : (
            <p className="text-2xl font-display font-bold text-foreground truncate">
              {value}
            </p>
          )}
        </div>
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: `${iconColor}20`,
            boxShadow: `0 0 16px ${iconColor}30`,
            border: `1px solid ${iconColor}30`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
      {/* Subtle bottom accent line */}
      <div
        className="mt-4 h-0.5 w-12 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${glowColor}, transparent)`,
        }}
      />
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      label: "Total Customers",
      value: stats ? Number(stats.totalCustomers) : 0,
      icon: Users,
      iconColor: "oklch(0.75 0.18 240)",
      glowColor: "oklch(0.75 0.18 240)",
    },
    {
      label: "Completed Sites",
      value: stats ? Number(stats.completedSites) : 0,
      icon: CheckCircle2,
      iconColor: "oklch(0.72 0.17 158)",
      glowColor: "oklch(0.72 0.17 158)",
    },
    {
      label: "Pending Sites",
      value: stats ? Number(stats.pendingSites) : 0,
      icon: Clock,
      iconColor: "oklch(0.78 0.18 75)",
      glowColor: "oklch(0.78 0.18 75)",
    },
    {
      label: "Total Received",
      value: stats ? formatINR(stats.totalAmountReceived) : "₹0",
      icon: TrendingUp,
      iconColor: "oklch(0.72 0.17 158)",
      glowColor: "oklch(0.72 0.17 158)",
    },
    {
      label: "Amount Pending",
      value: stats ? formatINR(stats.totalAmountPending) : "₹0",
      icon: AlertCircle,
      iconColor: "oklch(0.7 0.22 22)",
      glowColor: "oklch(0.7 0.22 22)",
    },
    {
      label: "Today's Tasks",
      value: stats ? Number(stats.todayTasksCount) : 0,
      icon: ListChecks,
      iconColor: "oklch(0.75 0.18 290)",
      glowColor: "oklch(0.75 0.18 290)",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div
        className="glass-card rounded-2xl p-6 animate-fade-in-up"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.07 258 / 80%), oklch(0.14 0.055 256 / 70%))",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <SunLogo size={64} />
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-gold-gradient">
                Smart Sun Power
              </h1>
              <h2 className="font-display font-semibold text-lg md:text-xl text-gold-gradient">
                Jodhpur
              </h2>
            </div>
          </div>
          <div className="sm:ml-auto text-right">
            <p className="text-sm text-muted-foreground">Solar CRM Dashboard</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Solar banner decoration */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Professional Solar Installation & Management — Rajasthan's Leading
            Solar CRM
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
          Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {statCards.map((card, i) => (
            <StatCard
              key={card.label}
              {...card}
              loading={isLoading}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* In-progress info */}
      {stats && Number(stats.inProgressSites) > 0 && (
        <div
          className="glass-card rounded-xl p-4 flex items-center gap-3 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "oklch(0.55 0.18 240 / 20%)",
              border: "1px solid oklch(0.55 0.18 240 / 30%)",
            }}
          >
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {Number(stats.inProgressSites)} site
              {Number(stats.inProgressSites) !== 1 ? "s" : ""} currently in
              progress
            </p>
            <p className="text-xs text-muted-foreground">
              Active solar installations underway
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
