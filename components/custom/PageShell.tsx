import * as React from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageShell({ children, className, contentClassName }: PageShellProps) {
  return (
    <main className={cn("min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24 pb-12 px-4", className)}>
      <div
        className={cn(
          "container mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700",
          contentClassName
        )}
      >
        {children}
      </div>
    </main>
  );
}

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  align?: "center" | "left";
};

export function PageHeader({
  title,
  description,
  className,
  align = "center",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <h1 className="text-4xl font-black tracking-tight text-gradient">{title}</h1>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground font-medium",
            align === "center" ? "max-w-2xl mx-auto" : ""
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
