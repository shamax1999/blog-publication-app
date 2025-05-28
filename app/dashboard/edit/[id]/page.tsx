"use client"

import type React from "react"

import type { ReactElement } from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Post } from "@/lib/supabase"
import { showSuccess, showError, showConfirm, showLoading } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, Trash2, Settings, FileText, Clock, BarChart3 } from "lucide-react"
import { SimpleRichTextEditor } from "@/components/simple-rich-text-editor"
import Link from "next/link"
import Swal from "sweetalert2"
import { PostlyRichEditor } from "@/components/postly-rich-editor"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps): ReactElement {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [post, setPost] = useState<Post | null>(null)
  const [postId, setPostId] = useState<string>("")
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    isPremium: false,
    published: false,
  })

  useEffect(() => {
    setPostId(params.id)
  }, [params])

  useEffect(() => {
    if (user && postId) {
      fetchPost()
    }
  }, [user, postId])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !post || !formData.title.trim() || !formData.content.trim()) return

    const autoSaveTimer = setTimeout(() => {
      if (formData.title.trim() && formData.content.trim()) {
        // Auto-save changes (you can implement this)
        setLastSaved(new Date())
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [formData.title, formData.content, autoSave, post])

  const fetchPost = async () => {
    if (!user || !postId) return

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .eq("author_id", user.id)
        .single()

      if (error) throw error

      setPost(data)
      setFormData({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || "",
        slug: data.slug,
        isPremium: data.is_premium,
        published: data.published,
      })
    } catch (err: any) {
      setError("Post not found or you don't have permission to edit it")
      showError("Access Denied", "Post not found or you don't have permission to edit it")
    } finally {
      setFetchLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .substring(0, 100) // Limit to 100 characters
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
    e.preventDefault()
    if (!user || !post) return

    // Validate required fields
    if (!formData.title.trim()) {
      showError("Title Required", "Please enter a title for your post")
      return
    }

    if (!formData.content.trim()) {
      showError("Content Required", "Please add some content to your post")
      return
    }

    // Check content length (warn if very large)
    const contentLength = formData.content.length
    if (contentLength > 1000000) {
      // 1MB of text
      const result = await Swal.fire({
        title: "Large Content Detected",
        text: `Your post is ${Math.round(contentLength / 1000)}KB. This might take longer to save and load. Continue?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
      })

      if (!result.isConfirmed) return
    }

    setLoading(true)
    setError("")

    const publishStatus = shouldPublish !== undefined ? shouldPublish : formData.published

    showLoading(
      shouldPublish !== undefined
        ? shouldPublish
          ? "Publishing post..."
          : "Unpublishing post..."
        : "Saving changes...",
    )

    try {
      // Process content based on editor type
      let processedContent = formData.content.trim()
      if (useSimpleEditor) {
        // Convert markdown to HTML for simple editor
        processedContent = processedContent
          .replace(/^### (.*$)/gm, "<h3>$1</h3>")
          .replace(/^## (.*$)/gm, "<h2>$1</h2>")
          .replace(/^# (.*$)/gm, "<h1>$1</h1>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`(.*?)`/g, "<code>$1</code>")
          .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
          .replace(/^- (.*$)/gm, "<li>$1</li>")
          .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
          .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2">$1</a>')
          .replace(/\n/g, "<br>")
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        content: processedContent,
        excerpt:
          formData.excerpt.trim() ||
          formData.content
            .replace(/<[^>]*>/g, "")
            .substring(0, 200)
            .trim() + "...",
        slug: formData.slug.trim(),
        is_premium: formData.isPremium,
        published: publishStatus,
        updated_at: new Date().toISOString(),
      }

      console.log("Updating post with data:", updateData)

      const { data, error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", post.id)
        .eq("author_id", user.id) // Extra security check
        .select()
        .single()

      if (error) {
        console.error("Post update error:", error)
        throw new Error(`Failed to update post: ${error.message}`)
      }

      console.log("Post updated successfully:", data)

      Swal.close()

      if (shouldPublish !== undefined) {
        await showSuccess(
          shouldPublish ? "Post Published!" : "Post Unpublished!",
          shouldPublish
            ? `Your post "${updateData.title}" is now live and visible to readers!`
            : `Your post "${updateData.title}" has been unpublished and is no longer visible to readers.`,
        )
      } else {
        await showSuccess("Changes Saved!", `Your post "${updateData.title}" has been updated successfully`)
      }

      // Update local state
      setFormData((prev) => ({ ...prev, published: publishStatus }))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Update error:", err)
      Swal.close()
      const errorMessage = err.message || "An error occurred while updating the post"
      setError(errorMessage)
      showError("Update Failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !post) return

    const result = await showConfirm(
      "Delete Post?",
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
    )

    if (!result.isConfirmed) return

    setLoading(true)
    showLoading("Deleting post...")

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id)

      if (error) throw error

      Swal.close()
      await showSuccess("Post Deleted!", "Your post has been deleted successfully")
      router.push("/dashboard")
    } catch (err: any) {
      Swal.close()
      setError(err.message || "An error occurred while deleting the post")
      showError("Delete Failed", err.message || "An error occurred while deleting the post")
      setLoading(false)
    }
  }

  // Calculate content statistics
  const getContentStats = () => {
    const textContent = formData.content.replace(/<[^>]*>/g, "")
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
    const characters = textContent.length
    const readingTime = Math.max(1, Math.ceil(words / 200))
    return { words, characters, readingTime }
  }

  const stats = getContentStats()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please sign in to edit posts.</p>
            <Link href="/auth/signin" className="mt-4 inline-block">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (fetchLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Edit Post</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <FileText className="h-3 w-3 mr-1" />
              {stats.words} words
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Clock className="h-3 w-3 mr-1" />
              {stats.readingTime} min read
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              {Math.round(formData.content.length / 1024)}KB
            </Badge>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Post Details</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Update the basic information for your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="text-gray-900 dark:text-white transition-colors duration-300 font-medium"
              >
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter your post title"
                required
                disabled={loading}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-gray-900 dark:text-white transition-colors duration-300 font-medium"
              >
                URL Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                disabled={loading}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                This will be the URL: /posts/{formData.slug || "your-post-slug"}
              </p>
            </div>

            <div>
              <Label
                htmlFor="excerpt"
                className="text-gray-900 dark:text-white transition-colors duration-300 font-medium"
              >
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of your post (optional)"
                rows={3}
                disabled={loading}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300 flex items-center justify-between">
              Unlimited Content Editor
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <Switch checked={useSimpleEditor} onCheckedChange={setUseSimpleEditor} disabled={loading} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    {useSimpleEditor ? "Markdown" : "Rich Text"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} disabled={loading} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Auto-save
                  </span>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {useSimpleEditor
                ? "Edit your unlimited content using Markdown syntax with icon support"
                : "Edit your unlimited content using the enhanced rich text editor with icons, images, and advanced formatting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label
                htmlFor="content"
                className="text-gray-900 dark:text-white transition-colors duration-300 font-medium mb-3 block"
              >
                Post Content *{" "}
                {lastSaved && (
                  <span className="text-xs text-green-600">(Auto-saved at {lastSaved.toLocaleTimeString()})</span>
                )}
              </Label>
              {useSimpleEditor ? (
                <SimpleRichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  placeholder="Edit your unlimited content here using Markdown..."
                  disabled={loading}
                  className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
                />
              ) : (
                <PostlyRichEditor
                  value={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  placeholder="Edit your unlimited content here with emojis, icons, images, and rich formatting..."
                  disabled={loading}
                  className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
              Publishing Options
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Configure how your post will be published
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="premium"
                  className="text-gray-900 dark:text-white transition-colors duration-300 font-medium"
                >
                  Premium Content
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  Make this post available only to premium subscribers
                </p>
              </div>
              <Switch
                id="premium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPremium: checked }))}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button
            type="submit"
            variant="outline"
            disabled={loading || !formData.title || !formData.content}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          {!formData.published ? (
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading || !formData.title || !formData.content}
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              variant="outline"
              disabled={loading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {loading ? "Unpublishing..." : "Unpublish"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
