export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse p-6 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-9 w-32 bg-gray-200 rounded-md" />
        <div className="h-8 w-48 bg-gray-200 rounded-md" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-md" />
        ))}
      </div>
    </div>
  )
}
