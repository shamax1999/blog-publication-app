"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface PostVerificationProps {
  postId?: string
  slug?: string
}

export function PostVerification({ postId, slug }: PostVerificationProps) {
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const verifyPost = async () => {
    if (!postId && !slug) return

    setLoading(true)
    try {
      let query = supabase.from("posts").select("*")

      if (postId) {
        query = query.eq("id", postId)
      } else if (slug) {
        query = query.eq("slug", slug)
      }

      const { data: post, error } = await query.single()

      if (error) {
        setVerification({ error: error.message, found: false })
      } else {
        setVerification({
          found: true,
          post,
          isPublished: post.published,
          canView: post.published || true, // You can see your own posts
        })
      }
    } catch (err: any) {
      setVerification({ error: err.message, found: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-blue-800 dark:text-blue-200">Post Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={verifyPost} disabled={loading || (!postId && !slug)} size="sm" className="mb-4">
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Verify Post Status
        </Button>

        {verification && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {verification.found ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={verification.found ? "text-green-700" : "text-red-700"}>
                {verification.found ? "Post found in database" : "Post not found"}
              </span>
            </div>

            {verification.found && (
              <>
                <div className="flex items-center gap-2">
                  {verification.isPublished ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={verification.isPublished ? "text-green-700" : "text-yellow-700"}>
                    {verification.isPublished ? "Post is published" : "Post is a draft"}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm">
                    <strong>Title:</strong> {verification.post.title}
                  </p>
                  <p className="text-sm">
                    <strong>Slug:</strong> {verification.post.slug}
                  </p>
                  <p className="text-sm">
                    <strong>Created:</strong> {new Date(verification.post.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Updated:</strong> {new Date(verification.post.updated_at).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {verification.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                <strong>Error:</strong> {verification.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
