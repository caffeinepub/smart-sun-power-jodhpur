import {
  CheckSquare,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { SunLogo } from "./SunLogo";

export type Page = "dashboard" | "customers" | "employees" | "tasks";

interface LayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "employees", label: "Employees", icon: UserCheck },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
];

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen"
        style={{
          background: "oklch(0.115 0.04 258)",
          borderRight: "1px solid oklch(0.3 0.07 255 / 20%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <SunLogo size={44} />
          <div>
            <div className="font-display font-bold text-sm leading-tight text-gold-gradient">
              Smart Sun
            </div>
            <div className="font-display font-bold text-sm leading-tight text-gold-gradient">
              Power Jodhpur
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "nav-item-active text-amber-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-300" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/5 space-y-3">
          {/* Auth button */}
          {isLoggedIn ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs text-emerald-400 font-medium truncate">
                  Logged In
                </span>
              </div>
              <button
                type="button"
                data-ocid="auth.logout.button"
                onClick={clear}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="auth.login.button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-navy-deep transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="h-3.5 w-3.5" />
              {isLoggingIn ? "Logging in…" : "Login"}
            </button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors"
            >
              Built with ♥ caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 flex flex-col md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "oklch(0.115 0.04 258)",
          borderRight: "1px solid oklch(0.3 0.07 255 / 20%)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <SunLogo size={40} />
            <div>
              <div className="font-display font-bold text-sm leading-tight text-gold-gradient">
                Smart Sun
              </div>
              <div className="font-display font-bold text-sm leading-tight text-gold-gradient">
                Power Jodhpur
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`mobile.nav.${item.id}.link`}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "nav-item-active text-amber-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-300" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{
            background: "oklch(0.115 0.04 258 / 95%)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(0.3 0.07 255 / 20%)",
          }}
        >
          <button
            type="button"
            data-ocid="mobile.menu.button"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <SunLogo size={32} />
            <span className="font-display font-bold text-sm text-gold-gradient">
              Smart Sun Power
            </span>
          </div>
          {isLoggedIn ? (
            <button
              type="button"
              data-ocid="auth.mobile.logout.button"
              onClick={clear}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/5 transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              type="button"
              data-ocid="auth.mobile.login.button"
              onClick={login}
              disabled={isLoggingIn}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-navy-deep transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Login"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isLoggingIn ? "…" : "Login"}
              </span>
            </button>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bottom-nav md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`bottom.nav.${item.id}.tab`}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? "text-amber-300" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_oklch(0.75_0.18_62)]" : ""}`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
