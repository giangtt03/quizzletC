export default function TopicListSkeleton() {
  // Tạo 5 skeleton items
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="rounded-lg border p-4">
          <div className="w-full">
            <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="mt-2 flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
