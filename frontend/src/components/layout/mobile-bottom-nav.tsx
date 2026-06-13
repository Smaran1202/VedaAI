"use client";

import { BarChart3, ClipboardList, Home, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canCreateAssignments } from "@/lib/roles";
import type { UserRole } from "@/types";

function itemsForRole(role?: UserRole | null) {
  const base =
    role === "student"
      ? [
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/assignments", label: "Mine", icon: ClipboardList },
          { href: "/library", label: "Results", icon: BarChart3 }
        ]
      : role === "admin"
      ? [
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/groups", label: "Users", icon: Users },
          { href: "/toolkit", label: "Analytics", icon: BarChart3 }
        ]
      : [
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/assignments", label: "Assign", icon: ClipboardList },
          { href: "/toolkit", label: "Analytics", icon: BarChart3 }
        ];

  return [
    ...base,
    ...(canCreateAssignments(role)
      ? [{ href: "/assignments/create", label: "Create", icon: Plus }]
      : []),
    { href: "/settings", label: "Settings", icon: Settings }
  ].slice(0, 5);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { role } = useCurrentUser();
  const items = itemsForRole(role);

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-5 rounded-3xl border border-white/10 bg-ink px-3 py-2 shadow-soft lg:hidden" aria-label="Primary navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/assignments"
            ? pathname === "/assignments"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const className = cn(
          "flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold text-white/55 outline-none transition hover:text-white focus:ring-2 focus:ring-white/20",
          active && "bg-white/10 text-white",
          item.label === "Create" && "text-orange-300"
        );

        return (
          <Link
            key={item.label}
            href={item.href}
            className={className}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
