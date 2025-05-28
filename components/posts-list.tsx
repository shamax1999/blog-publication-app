import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"

interface PostsListProps {
  searchQuery?: string
}

async function getPosts(searchQuery?: string) {
  try {
    let query = supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return []
    }

    console.log(`Found ${posts?.length || 0} published posts`)
    return posts || []
  } catch (err) {
    console.error("Exception fetching posts:", err)
    return []
  }
}

export async function PostsList({ searchQuery }: PostsListProps) {
  const posts = await getPosts(searchQuery)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
          {searchQuery ? `No posts found for "${searchQuery}"` : "No posts available yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
