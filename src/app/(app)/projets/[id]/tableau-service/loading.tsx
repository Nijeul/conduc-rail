export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-32 bg-gray-200 rounded" />
      </div>
      <div className="flex-1 bg-gray-100 rounded border border-gray-200" />
    </div>
  )
}
