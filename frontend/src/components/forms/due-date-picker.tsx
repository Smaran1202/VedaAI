"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import DatePicker from "react-datepicker";
import type ReactDatePicker from "react-datepicker";

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

export function DueDatePicker({ value, onChange, onBlur, error }: DueDatePickerProps) {
  const desktopPickerRef = useRef<ReactDatePicker | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedDate = isoToDate(value);
  const minDate = startOfToday();

  const openMobilePicker = () => {
    const input = mobileInputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if ("showPicker" in input && typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  return (
    <label className="mt-5 block">
      <span id="due-date-label" className="mb-1 block text-xs font-bold text-neutral-500">Due Date</span>

      <span className="relative hidden md:block">
        <DatePicker
          ref={desktopPickerRef}
          selected={selectedDate}
          onChange={(date: Date | null) => onChange(date ? dateToIso(date) : "")}
          onBlur={onBlur}
          minDate={minDate}
          dateFormat="dd-MM-yyyy"
          placeholderText="DD-MM-YYYY"
          className="control pr-10"
          wrapperClassName="block w-full"
          popperPlacement="bottom-start"
          shouldCloseOnSelect
          showPopperArrow={false}
          ariaLabelledBy="due-date-label"
        />
        <button
          type="button"
          onClick={() => desktopPickerRef.current?.setOpen(true)}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 outline-none transition hover:bg-neutral-100 hover:text-ink focus:ring-2 focus:ring-ink/10"
          aria-label="Open due date calendar"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </span>

      <span className="relative block md:hidden">
        <input
          ref={mobileInputRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          min={dateToIso(minDate)}
          className="control pr-10"
          aria-label="Due date"
        />
        <button
          type="button"
          onClick={openMobilePicker}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 outline-none transition hover:bg-neutral-100 hover:text-ink focus:ring-2 focus:ring-ink/10"
          aria-label="Open due date calendar"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </span>

      {error ? <span className="mt-1 block text-xs text-ember">{error}</span> : null}
    </label>
  );
}

function isoToDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
