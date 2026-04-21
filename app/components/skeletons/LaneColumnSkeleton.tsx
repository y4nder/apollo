export default function LaneColumnSkeleton() {
  return (
    <div className="apollo-card-strong overflow-hidden animate-pulse">
      <div className="h-14 border-b border-apollo-border bg-white/60" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-apollo-border rounded w-5/6" />
        <div className="h-3 bg-apollo-border rounded w-4/6" />
        <div className="h-3 bg-apollo-border rounded w-3/6" />
        <div className="h-3 bg-apollo-border rounded w-5/6" />
        <div className="h-3 bg-apollo-border rounded w-2/6" />
      </div>
    </div>
  );
}
