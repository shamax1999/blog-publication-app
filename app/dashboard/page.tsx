"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Post } from "@/lib/supabase"
import { showSuccess, showError, showConfirm } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, Plus, Eye, Edit, Trash2, BarChart3, Users, Crown, TrendingUp } from "lucide-react"
import Link from "next/link"
import { PostDebugInfo } from "@/components/post-debug-info"

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    if (!user) return

    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })

    setPosts(data || [])
    setLoading(false)
  }

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!user) return

    const result = await showConfirm(
      "Delete Post?",
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
    )

    if (!result.isConfirmed) return

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) {
        console.error("Delete error:", error)
        showError("Delete Failed", "Failed to delete post. Please try again.")
        return
      }

      // Remove the post from the local state
      setPosts(posts.filter((post) => post.id !== postId))
      showSuccess("Post Deleted!", "Your post has been deleted successfully.")
    } catch (err: any) {
      console.error("Delete error:", err)
      showError("Delete Failed", "An error occurred while deleting the post.")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 transition-colors duration-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
              Please sign in to access your dashboard.
            </p>
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
              {profile?.is_premium && <Crown className="inline h-8 w-8 ml-2 text-yellow-500" />}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Manage your posts and track your writing journey
            </p>
          </div>
          <Link href="/dashboard/new-post">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Post
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-white" />
                </div>
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 transition-colors duration-300">
                {posts.length}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300">
                All your articles
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 transition-colors duration-300">
                {posts.filter((p) => p.published).length}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 transition-colors duration-300">
                Live articles
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 transition-colors duration-300">
                {posts.filter((p) => p.is_premium).length}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 transition-colors duration-300">
                Premium content
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 transition-colors duration-300">
                {posts.filter((p) => !p.published).length}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 transition-colors duration-300">
                Work in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information - only show in development or when needed */}
        <PostDebugInfo />

        {/* Posts List */}
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white transition-colors duration-300">
              <BarChart3 className="h-6 w-6" />
              Your Posts
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Manage and edit your published content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center transition-colors duration-300">
                  <PenTool className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Start Your Writing Journey
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto transition-colors duration-300">
                  You haven't written any posts yet. Create your first article and share your thoughts with the world.
                </p>
                <Link href="/dashboard/new-post">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Write Your First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-6 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white transition-colors duration-300">
                          {post.title}
                        </h3>
                        <div className="flex gap-2">
                          {post.published ? (
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 transition-colors duration-300">
                              Published
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                            >
                              Draft
                            </Badge>
                          )}
                          {post.is_premium && (
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 transition-colors duration-300">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 transition-colors duration-300">
                        {post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 120) + "..."}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Created{" "}
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {post.published && (
                        <Link href={`/posts/${post.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 border-gray-200 dark:border-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/edit/${post.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-700 transition-all duration-300 border-gray-200 dark:border-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-700 transition-all duration-300 border-gray-200 dark:border-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
