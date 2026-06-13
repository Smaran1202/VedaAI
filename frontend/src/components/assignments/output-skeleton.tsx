export function OutputSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5" aria-label="Loading generated paper">
      <div className="rounded-2xl bg-ink p-5">
        <div className="h-4 w-3/4 rounded-lg bg-white/20" />
        <div className="mt-3 h-4 w-1/2 rounded-lg bg-white/15" />
      </div>
      <div className="mx-auto w-full max-w-[850px] rounded-2xl border border-line bg-white p-8">
        <div className="skeleton mx-auto h-7 w-80" />
        <div className="skeleton mx-auto mt-4 h-4 w-44" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
