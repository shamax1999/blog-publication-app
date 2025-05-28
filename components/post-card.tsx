import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, User, ArrowRight, Clock } from "lucide-react"

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

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  return (
    <Card className="group h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-[1.02] bg-white dark:bg-gray-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {post.is_premium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-md">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full transition-colors duration-300">
            <Clock className="h-3 w-3" />
            {getReadingTime(post.content)} min read
          </div>
        </div>

        <CardTitle className="line-clamp-2 text-xl font-bold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-gray-900 dark:text-white">
          <Link href={`/posts/${post.slug}`} className="block">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <CardDescription className="line-clamp-3 mb-6 text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
          {post.excerpt || post.content.substring(0, 150) + "..."}
        </CardDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                {post.author_name || post.author_email?.split("@")[0] || "Anonymous"}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                <Calendar className="h-3 w-3" />
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>

          <Link href={`/posts/${post.slug}`}>
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
