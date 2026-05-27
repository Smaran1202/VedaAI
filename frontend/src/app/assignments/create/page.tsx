import { CreateAssignmentForm } from "@/components/create-assignment-form";

export default function CreateAssignmentPage() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-5 text-center md:text-left">
        <h1 className="text-2xl font-black tracking-tight md:text-[26px]">Create Assignment</h1>
        <p className="mt-1 text-sm text-neutral-500">Set up a new assignment for your students.</p>
      </div>
      <CreateAssignmentForm />
    </section>
  );
}
