"use client"

import { useAuth } from "@/contexts/auth-context"
import { PostContent } from "@/components/post-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Lock } from "lucide-react"
import Link from "next/link"

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

interface PremiumGateProps {
  post: Post
}

export function PremiumGate({ post }: PremiumGateProps) {
  const { user, profile } = useAuth()

  // Show content if user is premium
  if (user && profile?.is_premium) {
    return <PostContent post={post} />
  }

  // Show premium gate
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>Premium Content</span>
          </div>
        </header>

        {/* Show excerpt or first part of content */}
        <div className="prose prose-lg max-w-none mb-8 dark:prose-invert transition-colors duration-300">
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
            {post.excerpt || post.content.substring(0, 300) + "..."}
          </p>
        </div>

        {/* Premium gate */}
        <Card className="border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 transition-colors duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Lock className="h-5 w-5" />
              Premium Content
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              This article is available to premium subscribers only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {user ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                  Upgrade to premium to access this content and support the author.
                </p>
                <Link href="/premium">
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                  Sign in and upgrade to premium to access this content.
                </p>
                <div className="space-x-2">
                  <Link href="/auth/signin">
                    <Button
                      variant="outline"
                      className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/premium">
                    <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                      <Crown className="h-4 w-4 mr-2" />
                      Get Premium
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </article>
    </div>
  )
}
