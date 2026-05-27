export function AssignmentListSkeleton() {
  return (
    <section className="mx-auto w-full max-w-5xl" aria-label="Loading assignments">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="skeleton h-7 w-36" />
          <div className="skeleton mt-2 h-4 w-72" />
        </div>
      </div>
      <div className="surface mb-4 flex gap-3 p-3">
        <div className="skeleton h-10 w-32" />
        <div className="ml-auto hidden h-10 w-80 rounded-xl bg-neutral-200/70 md:block" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-[126px] p-4">
            <div className="skeleton h-4 w-3/5" />
            <div className="skeleton mt-5 h-3 w-40" />
            <div className="skeleton mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    </section>
  );
}
