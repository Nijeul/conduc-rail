export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-3">
      <div className="flex gap-2 p-3 bg-[#F0F0F0] rounded-t-lg">
        <div className="h-8 w-36 bg-gray-500/30 rounded" />
        <div className="h-8 w-24 bg-gray-500/30 rounded" />
      </div>
      <div className="border border-gray-200 rounded-b-lg">
        <div className="h-10 bg-[#004489] rounded-t" />
        {[1, 2, 3, 4].map((i) => (
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
