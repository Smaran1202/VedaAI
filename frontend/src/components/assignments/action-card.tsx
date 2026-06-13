"use client";

import { Download } from "lucide-react";
import type { ReactNode } from "react";

interface ActionCardProps {
  children?: ReactNode;
  isDownloading?: boolean;
  onDownload?: () => void;
  subject?: string;
  title?: string;
}

export function ActionCard({
  children,
  isDownloading = false,
  onDownload,
  subject,
  title
}: ActionCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-ink p-4 text-white md:flex md:items-center md:justify-between md:p-5">
      <p className="max-w-2xl text-sm font-medium leading-6 text-white/90">
        {title
          ? `Your ${subject ?? "subject"} question paper for "${title}" is ready to review and export.`
          : "Your generated question paper is ready to review and export."}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <button
          type="button"
          onClick={onDownload}
          disabled={!onDownload || isDownloading}
          title={!onDownload ? "PDF download is available after generation completes" : undefined}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-ink outline-none transition hover:bg-neutral-100 focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Preparing PDF..." : "Download as PDF"}
        </button>
        {children}
      </div>
    </section>
  );
}
