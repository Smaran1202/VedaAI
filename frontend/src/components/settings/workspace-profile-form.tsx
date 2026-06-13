"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useWorkspaceProfile } from "@/hooks/use-workspace-profile";
import * as workspaceProfileService from "@/services/workspace-profile.service";

type FormState = {
  schoolName: string;
  city: string;
  board: string;
  academicYear: string;
  defaultClass: string;
};

const emptyProfile: FormState = {
  schoolName: "",
  city: "",
  board: "",
  academicYear: "",
  defaultClass: ""
};

export function WorkspaceProfileForm() {
  const { profile, setProfile, loading, error } = useWorkspaceProfile();
  const initialValues = useMemo<FormState>(
    () => ({
      schoolName: profile?.schoolName ?? "",
      city: profile?.city ?? "",
      board: profile?.board ?? "",
      academicYear: profile?.academicYear ?? "",
      defaultClass: profile?.defaultClass ?? ""
    }),
    [profile]
  );
  const [form, setForm] = useState<FormState>(emptyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setForm(initialValues);
    }
  }, [initialValues, loading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setSaveError(null);

    try {
      const saved = await workspaceProfileService.saveWorkspaceProfile(form);
      setProfile(saved);
      setMessage("Workspace profile saved.");
    } catch {
      setSaveError("Could not save workspace profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-5">
          <h1 className="text-2xl font-black tracking-tight md:text-[26px]">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Configure the school details used in your sidebar and generated question papers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface p-5 md:p-6">
          <h2 className="text-lg font-black">Workspace Profile</h2>

          {loading ? <p className="mt-4 text-sm font-semibold text-neutral-500">Loading profile...</p> : null}
          {error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Field label="School name">
              <input
                className="control"
                value={form.schoolName}
                onChange={(event) => setForm({ ...form, schoolName: event.target.value })}
                required
              />
            </Field>
            <Field label="City">
              <input
                className="control"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                required
              />
            </Field>
            <Field label="Board">
              <input
                className="control"
                value={form.board}
                onChange={(event) => setForm({ ...form, board: event.target.value })}
                placeholder="CBSE, ICSE, State Board"
              />
            </Field>
            <Field label="Academic year">
              <input
                className="control"
                value={form.academicYear}
                onChange={(event) => setForm({ ...form, academicYear: event.target.value })}
                placeholder="2026-2027"
              />
            </Field>
            <Field label="Default class">
              <input
                className="control"
                value={form.defaultClass}
                onChange={(event) => setForm({ ...form, defaultClass: event.target.value })}
                placeholder="8th"
              />
            </Field>
          </div>

          {message ? <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{message}</p> : null}
          {saveError ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{saveError}</p> : null}

          <button
            type="submit"
            disabled={isSaving || loading}
            className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
