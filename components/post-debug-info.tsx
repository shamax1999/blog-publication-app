"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

export function PostDebugInfo() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get user's posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })

      // Get published posts count
      const { count: publishedCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("published", true)

      // Get draft posts count
      const { count: draftCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("published", false)

      // Test database permissions
      const { data: testInsert, error: insertError } = await supabase
        .from("posts")
        .insert({
          title: "Test Post - DELETE ME",
          content: "This is a test post",
          excerpt: "Test excerpt",
          slug: `test-post-${Date.now()}`,
          is_premium: false,
          published: false,
          author_id: user.id,
          author_email: user.email || "",
          author_name: "Test User",
        })
        .select()

      // Clean up test post
      if (testInsert && testInsert[0]) {
        await supabase.from("posts").delete().eq("id", testInsert[0].id)
      }

      setDebugData({
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
        },
        posts: posts || [],
        counts: {
          total: posts?.length || 0,
          published: publishedCount || 0,
          drafts: draftCount || 0,
        },
        errors: {
          postsError: postsError?.message,
          insertError: insertError?.message,
        },
        permissions: {
          canInsert: !insertError,
          canSelect: !postsError,
        },
      })
    } catch (err: any) {
      console.error("Debug fetch error:", err)
      setDebugData({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card className="mt-4 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-200">
          <span>Debug Information</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-orange-600 hover:text-orange-700"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isVisible && (
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={fetchDebugInfo}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Debug Info
            </Button>
          </div>

          {debugData && (
            <div className="space-y-4">
              {debugData.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  <strong>Error:</strong> {debugData.error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">User Info</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">ID: {debugData.user?.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Email: {debugData.user?.email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Post Counts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total: {debugData.counts?.total}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Published: {debugData.counts?.published}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Drafts: {debugData.counts?.drafts}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Permissions</h4>
                    <div className="flex gap-2">
                      <Badge variant={debugData.permissions?.canSelect ? "default" : "destructive"}>
                        {debugData.permissions?.canSelect ? "✓ Can Read" : "✗ Cannot Read"}
                      </Badge>
                      <Badge variant={debugData.permissions?.canInsert ? "default" : "destructive"}>
                        {debugData.permissions?.canInsert ? "✓ Can Write" : "✗ Cannot Write"}
                      </Badge>
                    </div>
                  </div>

                  {debugData.errors?.postsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                      <strong>Posts Error:</strong> {debugData.errors.postsError}
                    </div>
                  )}

                  {debugData.errors?.insertError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                      <strong>Insert Error:</strong> {debugData.errors.insertError}
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Posts</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {debugData.posts?.slice(0, 5).map((post: any) => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <span className="text-sm truncate">{post.title}</span>
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      ))}
                      {debugData.posts?.length === 0 && <p className="text-sm text-gray-500 italic">No posts found</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
