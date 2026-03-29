export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse p-6 space-y-6">
      <div className="h-7 w-56 bg-gray-200 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
