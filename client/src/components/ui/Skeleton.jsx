export const MovieCardSkeleton = () => (
  <div className="bg-gray-900 rounded-xl overflow-hidden">
    <div className="skeleton h-72 w-full" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-5 w-3/4" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-8 w-full mt-3" />
    </div>
  </div>
);
export const MovieGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => <MovieCardSkeleton key={i} />)}
  </div>
);
export const HeroBannerSkeleton = () => <div className="skeleton h-[85vh] w-full" />;
export const DetailSkeleton = () => (
  <div className="min-h-screen bg-gray-950">
    <div className="skeleton h-[50vh] w-full" />
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-10 w-2/3" /><div className="skeleton h-5 w-1/3" /><div className="skeleton h-24 w-full" />
    </div>
  </div>
);
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-lg" />)}
  </div>
);
