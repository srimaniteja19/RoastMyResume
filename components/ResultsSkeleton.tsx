export function ResultsSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-5 px-8 py-10 md:grid-cols-2 md:px-12">
      <div className="glass-card">
        <div className="card-eyebrow">Loading...</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skel mb-2" />
        ))}
      </div>
      <div className="glass-card">
        <div className="card-eyebrow">Loading...</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skel mb-2" />
        ))}
      </div>
      <div className="glass-card col-span-full">
        <div className="card-eyebrow">Loading...</div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skel mb-2" />
        ))}
      </div>
    </div>
  );
}
