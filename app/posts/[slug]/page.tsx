import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PostContent } from "@/components/post-content"
import { PremiumGate } from "@/components/premium-gate"

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getPost(slug: string) {
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      author_email,
      author_name
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (error) {
    console.error("Error fetching post:", error)
    return null
  }

  return post
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  if (post.is_premium) {
    return <PremiumGate post={post} />
  }

  return <PostContent post={post} />
}
