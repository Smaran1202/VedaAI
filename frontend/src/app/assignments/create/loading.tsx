export default function CreateAssignmentLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-5">
        <div className="skeleton h-7 w-52" />
        <div className="skeleton mt-2 h-4 w-72" />
      </div>
      <div className="mx-auto w-full max-w-[720px]">
        <div className="skeleton mb-5 h-1.5 w-full rounded-full" />
        <div className="surface p-6">
          <div className="skeleton h-6 w-44" />
          <div className="skeleton mt-2 h-4 w-72" />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
          <div className="skeleton mt-5 h-32" />
          <div className="mt-6 space-y-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        </div>
      </div>
    </section>
  );
}
