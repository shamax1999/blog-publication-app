import { Suspense } from "react"
import { PostsList } from "@/components/posts-list"
import { SearchPosts } from "@/components/search-posts"
import { Card, CardContent } from "@/components/ui/card"

interface PostsPageProps {
  searchParams: {
    q?: string
  }
}

export default function PostsPage({ searchParams }: PostsPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
          All Posts
        </h1>
        <SearchPosts />
      </div>

      <Suspense fallback={<PostsListSkeleton />}>
        <PostsList searchQuery={searchParams.q} />
      </Suspense>
    </div>
  )
}

function PostsListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="h-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
