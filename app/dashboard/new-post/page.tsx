"use client"

import type React from "react"

import { useEffect } from "react"

import type { ReactElement } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { showSuccess, showError, showLoading } from "@/lib/sweetalert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, Database, Copy, ExternalLink, Settings, FileText, Clock, BarChart3 } from "lucide-react"
import { SimpleRichTextEditor } from "@/components/simple-rich-text-editor"
import Link from "next/link"
import Swal from "sweetalert2"
import { PostlyRichEditor } from "@/components/postly-rich-editor"

export default function NewPostPage(): ReactElement {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [setupMode, setSetupMode] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const setupSQL = `-- Enhanced Blog App Database Setup for Unlimited Content
-- Copy and paste this into your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Published posts viewable by everyone" 
ON public.posts FOR SELECT 
USING (published = true);

CREATE POLICY "Authors can view own posts" 
ON public.posts FOR SELECT 
USING (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can insert own posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can update own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can delete own posts" 
ON public.posts FOR DELETE 
USING (auth.uid()::text = author_id::text);

-- Create indexes for better performance with large content
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_content_length_idx ON public.posts(length(content));

-- Grant permissions
GRANT ALL ON TABLE public.posts TO anon, authenticated;`

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !formData.title.trim() || !formData.content.trim()) return

    const autoSaveTimer = setTimeout(() => {
      if (formData.title.trim() && formData.content.trim()) {
        // Auto-save as draft (you can implement this)
        setLastSaved(new Date())
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [formData.title, formData.content, autoSave])

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(setupSQL)
      setCopied(true)
      showSuccess("Copied!", "SQL script copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      showError("Copy Failed", "Failed to copy to clipboard")
    }
  }

  const testDatabase = async () => {
    try {
      const { data, error } = await supabase.from("posts").select("id").limit(1)

      if (error) {
        console.error("Database test error:", error)
        if (error.message.includes("does not exist") || error.message.includes("relation") || error.code === "42P01") {
          return false
        }
        return true
      }

      return true
    } catch (err) {
      console.error("Database test exception:", err)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent, shouldPublish = false) => {
    e.preventDefault()
    if (!user) {
      showError("Authentication Required", "You must be signed in to create a post")
      return
    }

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

    showLoading(shouldPublish ? "Publishing your post..." : "Saving your draft...")

    try {
      const tableExists = await testDatabase()
      if (!tableExists) {
        Swal.close()
        setSetupMode(true)
        setError("Database tables need to be created. Please follow the setup instructions below.")
        setLoading(false)
        showError("Database Setup Required", "Please set up the database tables first")
        return
      }

      let finalSlug = formData.slug.trim()
      if (!finalSlug) {
        finalSlug = generateSlug(formData.title)
      }

      // Ensure slug is not empty and has reasonable length
      if (!finalSlug || finalSlug.length < 3) {
        finalSlug = `post-${Date.now()}`
      }

      // Limit slug length to prevent database issues
      finalSlug = finalSlug.substring(0, 100)

      let slugCounter = 0
      let uniqueSlug = finalSlug

      while (true) {
        const { data: existingPost } = await supabase.from("posts").select("id").eq("slug", uniqueSlug).maybeSingle()

        if (!existingPost) {
          break
        }

        slugCounter++
        const suffix = `-${slugCounter}`
        const maxBaseLength = 100 - suffix.length
        uniqueSlug = finalSlug.substring(0, maxBaseLength) + suffix
      }

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

      const postData = {
        title: formData.title.trim(),
        content: processedContent,
        excerpt:
          formData.excerpt.trim() ||
          formData.content
            .replace(/<[^>]*>/g, "")
            .substring(0, 200)
            .trim() + "...",
        slug: uniqueSlug,
        is_premium: formData.isPremium,
        published: shouldPublish,
        author_id: user.id,
        author_email: user.email || "",
        author_name: user.user_metadata?.full_name || user.user_metadata?.name || "Anonymous",
      }

      console.log("Creating post with data:", postData)

      const { data, error } = await supabase.from("posts").insert([postData]).select().single()

      if (error) {
        console.error("Post creation error:", error)
        throw new Error(`Failed to create post: ${error.message}`)
      }

      console.log("Post created successfully:", data)

      Swal.close()

      if (shouldPublish) {
        await showSuccess(
          "Post Published!",
          `Your post "${postData.title}" has been published successfully and is now live!`,
        )
      } else {
        await showSuccess("Draft Saved!", `Your post "${postData.title}" has been saved as a draft`)
      }

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Submit error:", err)
      Swal.close()
      const errorMessage = err.message || "An error occurred while saving the post. Please try again."
      setError(errorMessage)
      showError("Save Failed", errorMessage)
    } finally {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <CardContent className="p-6 text-center">
            <p className="text-gray-900 dark:text-white transition-colors duration-300">
              Please sign in to create a post.
            </p>
            <Link href="/auth/signin" className="mt-4 inline-block">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Create New Post
        </h1>
        <div className="flex items-center gap-2 ml-auto">
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
      </div>

      {setupMode && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Database Setup Required</h2>
            </div>
            <p className="text-blue-800 dark:text-blue-200 mb-4">Follow these steps to set up your database:</p>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors duration-300">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Step 1: Open Supabase Dashboard</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Go to your Supabase project dashboard and navigate to the SQL Editor.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  Open Supabase Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors duration-300">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Step 2: Copy SQL Script</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Copy the enhanced SQL script below and paste it into the SQL Editor:
                </p>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200 max-h-40">
                    {setupSQL}
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors duration-300">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Step 3: Run & Refresh</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Click "Run" in the SQL Editor, then refresh this page.
                </p>
                <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700 text-white">
                  Refresh Page After Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && (
          <Alert
            variant="destructive"
            className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 transition-colors duration-300"
          >
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">Post Details</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Fill in the basic information for your unlimited content post
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
                disabled={loading || setupMode}
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
                disabled={loading || setupMode}
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
                disabled={loading || setupMode}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                If left empty, we'll use the first 200 characters of your content
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white transition-colors duration-300">
              Unlimited Content Editor
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <Switch
                    checked={useSimpleEditor}
                    onCheckedChange={setUseSimpleEditor}
                    disabled={loading || setupMode}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    {useSimpleEditor ? "Markdown" : "Rich Text"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} disabled={loading || setupMode} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Auto-save
                  </span>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {useSimpleEditor
                ? "Write unlimited content using Markdown syntax with icon support"
                : "Write unlimited content using the enhanced rich text editor with icons, images, and advanced formatting"}
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
                  placeholder="Write your unlimited content here using Markdown..."
                  disabled={loading || setupMode}
                  className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
                />
              ) : (
                <PostlyRichEditor
                  value={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  placeholder="Write your unlimited content here with emojis, icons, images, and rich formatting..."
                  disabled={loading || setupMode}
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
              Configure how your unlimited content post will be published
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
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Make this post available only to premium subscribers
                </p>
              </div>
              <Switch
                id="premium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPremium: checked }))}
                disabled={loading || setupMode}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            variant="outline"
            disabled={loading || setupMode || !formData.title.trim() || !formData.content.trim()}
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading || setupMode || !formData.title.trim() || !formData.content.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </form>
    </div>
  )
}
