import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, PenTool, Shield, Zap, ArrowRight, Sparkles, Users, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { PostCard } from "@/components/post-card"

async function getRecentPosts() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching recent posts:", error)
    return []
  }

  return posts || []
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts()

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Welcome to Postly
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight transition-colors duration-300">
              Share Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
                Stories
              </span>
              <br />
              with the World
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
              Postly is a modern blog platform where writers can share unlimited content, add rich formatting with icons
              and emojis, and monetize premium articles through subscriptions. Join thousands of creators building their
              audience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
                >
                  <PenTool className="h-5 w-5 mr-2" />
                  Start Writing Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/posts">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                >
                  Browse Posts
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  10K+
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Writers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  50K+
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  1M+
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Readers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Postly provides all the tools and features you need to create, publish, and monetize your unlimited
              content with rich formatting, emojis, and icons.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  Unlimited Writing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-300">
                  Write unlimited content with our enhanced editor featuring emojis 😊, icons, rich formatting, and
                  image support for engaging posts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  Premium Content
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-300">
                  Monetize your best content with premium subscriptions and build a sustainable income from your writing
                  on Postly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  Secure Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-300">
                  Built with modern security practices to protect your content, user data, and intellectual property on
                  Postly.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Latest Stories
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Discover amazing content from our Postly community of writers
              </p>
            </div>
            <Link href="/posts">
              <Button
                variant="outline"
                size="lg"
                className="hidden sm:flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                View All Posts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                No posts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 transition-colors duration-300">
                Be the first to publish amazing content on Postly!
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-12 sm:hidden">
            <Link href="/posts">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                View All Posts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Writing Journey on Postly?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-10 leading-relaxed">
            Join thousands of writers who are already building their audience and earning from their passion on Postly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Postly Community
              </Button>
            </Link>
            <Link href="/premium">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 border-white text-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                <Crown className="h-5 w-5 mr-2" />
                Explore Premium
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
