"use client";

import React, { useState } from "react";
import type { FC, ReactNode } from "react";
import { WalletCards, LayoutGrid, ArrowRightLeft, PlusCircle } from "lucide-react";
import Image from "next/image";

export type ActiveView = "dashboard" | "transactions" | "add";

interface ExpenseTrackerLayoutProps {
  children: (activeView: ActiveView) => ReactNode;
  defaultView?: ActiveView;
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

const navItems: { view: ActiveView; label: string; icon: React.ElementType }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { view: "add", label: "Add", icon: PlusCircle },
  { view: "transactions", label: "Transactions", icon: ArrowRightLeft },
];

interface MobileNavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavItem: FC<MobileNavItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClasses = "text-primary bg-primary/10";
  const inactiveClasses = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  return (
    <button
      onClick={onClick}
      className={`flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isActive ? activeClasses : inactiveClasses
      }`}
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );
};

const ExpenseTrackerLayout: FC<ExpenseTrackerLayoutProps> = ({ children, defaultView = "dashboard", activeView: controlledView, onViewChange }) => {
  const [internalView, setInternalView] = useState<ActiveView>(defaultView);

  const isControlled = controlledView !== undefined && onViewChange;
  const activeView = isControlled ? controlledView! : internalView;
  const setActiveView = isControlled ? onViewChange! : setInternalView;

  return (
    <div className="min-h-screen w-full bg-secondary font-sans antialiased">
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-background md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="ExpenseTracker" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-bold tracking-tight text-foreground">ExpenseTracker</span>
          </div>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  className={`flex items-center gap-1 rounded-md px-4 py-2 font-semibold transition-all duration-100
                    ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                  `}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => setActiveView(item.view)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24 md:container md:mx-auto md:py-8">{children(activeView)}</main>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-[0_-1px_8px_rgba(0,0,0,0.04)] md:hidden">
        <nav className="grid h-[4.5rem] grid-cols-3 items-stretch gap-2 p-2">
          {navItems.map((item) => (
            <MobileNavItem key={item.view} icon={item.icon} label={item.label} isActive={activeView === item.view} onClick={() => setActiveView(item.view)} />
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default ExpenseTrackerLayout;
