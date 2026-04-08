export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-9 w-36 bg-gray-200 rounded" />
        <div className="h-7 w-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-lg border border-gray-200" />
        ))}
      </div>
    </div>
  )
}
