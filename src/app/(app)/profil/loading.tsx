export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse p-6 space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-md" />
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-md" />
          </div>
        ))}
      </div>
      <div className="h-10 w-40 bg-gray-200 rounded-md" />
    </div>
  )
}
