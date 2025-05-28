import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, User } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  is_premium: boolean
  published: boolean
  created_at: string
  updated_at: string
  author_id: string
  author_email: string
  author_name?: string
}

interface PostContentProps {
  post: Post
}

export function PostContent({ post }: PostContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.is_premium && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 transition-colors duration-300"
              >
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author_name || post.author_email?.split("@")[0] || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert transition-colors duration-300">
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  )
}
