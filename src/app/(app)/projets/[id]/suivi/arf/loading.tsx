export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div>
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
      </div>
      <div className="border border-gray-200 rounded">
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
