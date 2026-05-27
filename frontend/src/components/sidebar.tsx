"use client";

import {
  BookOpen,
  ClipboardList,
  Home,
  Library,
  Plus,
  Settings,
  Sparkles,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SCHOOL_PROFILE } from "@/lib/constants";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, count: 3 },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: "/library", label: "My Library", icon: Library }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-[242px] flex-col rounded-3xl border border-line bg-white p-3.5 shadow-card lg:flex">
      <Link href="/assignments" className="rounded-2xl px-2 py-1.5 text-[22px] font-black tracking-tight outline-none focus:ring-2 focus:ring-ink/10">
        VedaAI
      </Link>

      <Link
        href="/assignments/create"
        className="btn-primary mt-5 h-10 px-3 text-[13px]"
      >
        <Plus className="h-4 w-4" />
        Create Assignment
      </Link>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/assignments"
              ? pathname === "/assignments" || pathname.startsWith("/assignments/")
              : pathname.startsWith(item.href);
          const className = cn(
            "flex h-10 items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold text-neutral-600 outline-none transition hover:bg-neutral-50 hover:text-ink focus:ring-2 focus:ring-ink/10",
            active && "bg-neutral-100 text-ink"
          );

          return (
            <Link
              key={item.label}
              href={item.href}
              className={className}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="rounded-full bg-ember px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className={cn(
          "mb-2 flex h-10 items-center gap-2.5 rounded-xl px-3 text-left text-[13px] font-semibold text-neutral-600 outline-none transition hover:bg-neutral-50 hover:text-ink focus:ring-2 focus:ring-ink/10",
          pathname.startsWith("/settings") && "bg-neutral-100 text-ink"
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>

      <div className="rounded-2xl border border-line bg-neutral-50 p-3.5">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <p className="text-sm font-black">{SCHOOL_PROFILE.name}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{SCHOOL_PROFILE.location}</p>
      </div>
    </aside>
  );
}
