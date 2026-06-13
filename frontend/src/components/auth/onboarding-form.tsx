"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as userService from "@/services/user.service";
import type { UserRole } from "@/types";

const roles: Array<{ role: UserRole; label: string; description: string }> = [
  {
    role: "teacher",
    label: "Teacher",
    description: "Create assignments, generate papers, and manage assessment workflows."
  },
  {
    role: "student",
    label: "Student",
    description: "View assignments and prepare for future attempt flows."
  },
  {
    role: "admin",
    label: "Admin",
    description: "Manage users and monitor the platform workspace."
  }
];

export function OnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole>("teacher");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await userService.completeOnboarding({
        role: selectedRole,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "VedaAI User"
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to save role. Please check your session and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="surface p-6 md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Welcome</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
          Choose your VedaAI role
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          This sets your workspace navigation and permissions. You can refine role management
          later from the admin experience.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {roles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => setSelectedRole(item.role)}
              className={`rounded-2xl border p-4 text-left outline-none transition focus:ring-2 focus:ring-ink/10 ${
                selectedRole === item.role
                  ? "border-ink bg-neutral-50"
                  : "border-line bg-white hover:border-neutral-300"
              }`}
            >
              <span className="text-sm font-black">{item.label}</span>
              <span className="mt-2 block text-xs leading-5 text-neutral-500">{item.description}</span>
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-ember">{error}</p> : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSaving}
          className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  );
}
