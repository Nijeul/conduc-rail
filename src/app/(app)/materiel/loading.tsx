export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-200">
        <div className="h-9 w-64 bg-gray-200 rounded-md" />
        <div className="h-9 w-24 bg-gray-200 rounded-md" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        <div className="h-10 bg-[#004489] rounded-t" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 rounded"
            style={{ backgroundColor: i % 2 === 0 ? '#F0F0F0' : '#FFFFFF' }}
          />
        ))}
      </div>
    </div>
  )
}
