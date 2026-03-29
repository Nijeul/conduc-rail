export default function Loading() {
  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col animate-pulse">
      <div className="h-6 w-64 bg-gray-200 rounded mb-3" />
      <div className="flex gap-2 mb-2">
        <div className="h-8 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded" />
      </div>
      <div className="flex-1 border border-gray-200 rounded bg-gray-50" />
    </div>
  )
}
