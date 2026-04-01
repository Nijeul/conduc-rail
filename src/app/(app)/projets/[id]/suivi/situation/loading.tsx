export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div>
        <div className="h-7 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-80 bg-gray-100 rounded mt-2" />
      </div>
      <div className="flex gap-3 items-center">
        <div className="h-9 w-36 bg-gray-200 rounded" />
        <div className="h-9 w-36 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded" />
      </div>
      <div className="border border-gray-200 rounded">
        <div className="h-10 bg-[#004489] rounded-t" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10"
            style={{ backgroundColor: i % 2 === 0 ? '#F0F0F0' : '#FFFFFF' }}
          />
        ))}
      </div>
    </div>
  )
}
