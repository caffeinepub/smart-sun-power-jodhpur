import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useRef } from "react";
import { Layout, type Page } from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { TasksPage } from "./pages/TasksPage";
import { seedIfEmpty } from "./utils/seedData";

function AppContent() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seededRef = useRef(false);

  // Seed sample data on first load once actor is ready
  useEffect(() => {
    if (!actor || isFetching || seededRef.current) return;
    seededRef.current = true;

    seedIfEmpty(actor).then((didSeed) => {
      if (didSeed) {
        // Invalidate all queries so data refreshes
        queryClient.invalidateQueries();
      }
    });
  }, [actor, isFetching, queryClient]);

  return (
    <>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "customers" && <CustomersPage />}
        {activePage === "employees" && <EmployeesPage />}
        {activePage === "tasks" && <TasksPage />}
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.06 256)",
            border: "1px solid oklch(0.3 0.07 255 / 30%)",
            color: "oklch(0.95 0.01 240)",
          },
        }}
      />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
