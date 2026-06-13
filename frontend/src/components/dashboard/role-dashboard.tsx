"use client";

import { AlertCircle, BarChart3, CalendarClock, CheckCircle2, ClipboardList, FileText, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCurrentUser } from "@/hooks/use-current-user";
import * as assignmentService from "@/services/assignment.service";
import * as userService from "@/services/user.service";
import type { Assignment, AssignmentStatus, PlatformSummary } from "@/types";

function normalizeStatus(status: string): AssignmentStatus {
  return ["queued", "processing", "completed", "failed"].includes(status)
    ? (status as AssignmentStatus)
    : "queued";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function isUpcoming(assignment: Assignment) {
  return new Date(assignment.dueDate).getTime() >= Date.now();
}

export function RoleDashboard() {
  const { user, role, loading, needsOnboarding } = useCurrentUser();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || needsOnboarding || !role) {
      return;
    }

    let mounted = true;

    async function loadDashboard() {
      setIsLoadingData(true);
      setError(null);

      try {
        const assignmentResponse = await assignmentService.getAssignments({
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc"
        });
        const platformSummary =
          role === "admin" ? await userService.getPlatformSummary() : null;

        if (!mounted) {
          return;
        }

        setAssignments(assignmentResponse.data);
        setSummary(platformSummary);
      } catch {
        if (mounted) {
          setError("Unable to load dashboard data. Please refresh and try again.");
        }
      } finally {
        if (mounted) {
          setIsLoadingData(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [loading, needsOnboarding, role]);

  const stats = useMemo(() => {
    const completed = assignments.filter((assignment) => assignment.status === "completed");
    const upcoming = assignments.filter(isUpcoming);

    return {
      total: assignments.length,
      completed: completed.length,
      upcoming: upcoming.length,
      generated: assignments.filter((assignment) => assignment.generatedPaper).length
    };
  }, [assignments]);

  if (isLoadingData || loading) {
    return (
      <section className="grid min-h-[420px] place-items-center">
        <div className="surface p-6 text-center">
          <p className="text-sm font-black">Loading dashboard...</p>
          <p className="mt-1 text-xs text-neutral-500">Preparing your role workspace.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="surface p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-ember" />
          <div>
            <h1 className="text-lg font-black">Dashboard unavailable</h1>
            <p className="mt-1 text-sm text-neutral-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (role === "student") {
    return <StudentDashboard assignments={assignments} name={user?.name} stats={stats} />;
  }

  if (role === "admin") {
    return <AdminDashboard summary={summary} assignments={assignments} name={user?.name} />;
  }

  return <TeacherDashboard assignments={assignments} name={user?.name} stats={stats} />;
}

function Header({ name, label }: { name?: string; label: string }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">{label}</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight md:text-[32px]">
        Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
      </h1>
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon
}: {
  title: string;
  value: number | string;
  detail: string;
  icon: typeof ClipboardList;
}) {
  return (
    <article className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">{title}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-neutral-50">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-neutral-500">{detail}</p>
    </article>
  );
}

function TeacherDashboard({
  assignments,
  name,
  stats
}: {
  assignments: Assignment[];
  name?: string;
  stats: { total: number; generated: number; completed: number; upcoming: number };
}) {
  return (
    <section>
      <Header name={name} label="Teacher dashboard" />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard title="Total assignments" value={stats.total} detail="Created in your workspace." icon={ClipboardList} />
        <StatCard title="Generated papers" value={stats.generated} detail="Papers with structured AI output." icon={FileText} />
        <StatCard title="Ready papers" value={stats.completed} detail="Completed generation jobs." icon={CheckCircle2} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentAssignments assignments={assignments} title="Recent assignments" />
        <QuickLinks
          links={[
            { href: "/assignments/create", label: "Create Assignment", icon: Plus },
            { href: "/assignments", label: "View Assignments", icon: ClipboardList },
            { href: "/toolkit", label: "Analytics", icon: BarChart3 }
          ]}
        />
      </div>
    </section>
  );
}

function StudentDashboard({
  assignments,
  name,
  stats
}: {
  assignments: Assignment[];
  name?: string;
  stats: { total: number; generated: number; completed: number; upcoming: number };
}) {
  const upcoming = assignments.filter(isUpcoming);

  return (
    <section>
      <Header name={name} label="Student dashboard" />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard title="Assigned assessments" value={stats.total} detail="Assessments available to view." icon={ClipboardList} />
        <StatCard title="Upcoming due dates" value={stats.upcoming} detail="Assessments still within due date." icon={CalendarClock} />
        <StatCard title="Completed assessments" value={stats.completed} detail="Completed assessment records." icon={CheckCircle2} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <RecentAssignments assignments={upcoming} title="Upcoming due dates" emptyText="No upcoming assessments yet." />
        <div className="surface p-5">
          <h2 className="text-lg font-black">Results summary</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Results will appear here after student attempt and grading workflows are enabled.
          </p>
          {assignments.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">
              No assignments have been shared with you yet.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AdminDashboard({
  summary,
  assignments,
  name
}: {
  summary: PlatformSummary | null;
  assignments: Assignment[];
  name?: string;
}) {
  const fallback = {
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalAssignments: assignments.length
  };
  const stats = summary ?? fallback;

  return (
    <section>
      <Header name={name} label="Admin dashboard" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total users" value={stats.totalUsers} detail="All onboarded accounts." icon={Users} />
        <StatCard title="Teachers" value={stats.totalTeachers} detail="Teacher workspaces." icon={ClipboardList} />
        <StatCard title="Students" value={stats.totalStudents} detail="Student accounts." icon={Users} />
        <StatCard title="Assignments" value={stats.totalAssignments} detail="Platform assignment volume." icon={FileText} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <StatCard title="Admins" value={stats.totalAdmins} detail="Platform operators." icon={Users} />
        <StatCard title="Recent activity" value={assignments.length} detail="Latest assignment records loaded." icon={BarChart3} />
        <StatCard title="Usage health" value="Active" detail="MongoDB-backed workspace summary." icon={CheckCircle2} />
      </div>
    </section>
  );
}

function RecentAssignments({
  assignments,
  title,
  emptyText = "No assignments yet."
}: {
  assignments: Assignment[];
  title: string;
  emptyText?: string;
}) {
  return (
    <div className="surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{title}</h2>
        <Link href="/assignments" className="text-sm font-black text-ember">
          View all
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-3">
          {assignments.slice(0, 5).map((assignment) => (
            <Link
              key={assignment.id}
              href={`/assignments/${assignment.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 outline-none transition hover:bg-neutral-50 focus:ring-2 focus:ring-ink/10"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{assignment.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {assignment.subject} - Due {formatDate(assignment.dueDate)}
                </p>
              </div>
              <StatusBadge status={normalizeStatus(assignment.status)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickLinks({
  links
}: {
  links: Array<{ href: string; label: string; icon: typeof ClipboardList }>;
}) {
  return (
    <div className="surface p-5">
      <h2 className="text-lg font-black">Quick links</h2>
      <div className="mt-4 grid gap-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl border border-line p-3 text-sm font-black outline-none transition hover:bg-neutral-50 focus:ring-2 focus:ring-ink/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-50">
                <Icon className="h-4 w-4" />
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
