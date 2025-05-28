"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, Star, Zap, Sparkles, Users, BookOpen, Shield } from "lucide-react"
import Link from "next/link"

export default function PremiumPage() {
  const { user, profile } = useAuth()

  // If user is already premium
  if (profile?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">You're Premium!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Thank you for supporting our platform. Enjoy unlimited access to premium content and exclusive features.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-900 dark:text-white">
                <Crown className="h-6 w-6 text-yellow-500" />
                Premium Member
              </CardTitle>
              <CardDescription className="text-lg text-gray-900 dark:text-white">
                Your subscription is active and ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Unlimited premium articles</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Support content creators</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Early access to new features</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Ad-free reading experience</span>
                </div>
              </div>
              <div className="text-center pt-6">
                <Link href="/posts">
                  <Button
                    size="lg"
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse Premium Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-yellow-400/20 dark:bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Premium Membership
          </Badge>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Upgrade to{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Premium
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Get unlimited access to premium content and support the writers you love. Join thousands of readers who are
            already enjoying the best stories.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Free</CardTitle>
                <CardDescription className="text-lg text-gray-900 dark:text-white">
                  Perfect for casual readers
                </CardDescription>
                <div className="text-4xl font-bold mt-4">
                  $0<span className="text-lg font-normal text-gray-500 dark:text-gray-300">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Access to free articles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Basic search functionality</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Community features</span>
                  </div>
                </div>
                {!user ? (
                  <Link href="/auth/signup" className="block">
                    <Button
                      variant="outline"
                      className="w-full py-3 text-lg hover:bg-gray-50 transition-all duration-300"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full py-3 text-lg" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-yellow-300 dark:border-yellow-600 shadow-2xl scale-105 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 text-sm font-semibold">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Premium</CardTitle>
                <CardDescription className="text-lg text-gray-900 dark:text-white">
                  For serious readers and supporters
                </CardDescription>
                <div className="text-4xl font-bold mt-4">
                  $9<span className="text-lg font-normal text-gray-500 dark:text-gray-300">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Everything in Free</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Unlimited premium articles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Support content creators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Early access to new features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Ad-free reading experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Premium badge</span>
                  </div>
                </div>
                {user ? (
                  <Button
                    className="w-full py-3 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/create-subscription', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        const data = await response.json();
                        
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Failed to start checkout process');
                      }
                    }}
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to Premium
                  </Button>
                ) : (
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full py-3 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Crown className="h-5 w-5 mr-2" />
                      Sign Up for Premium
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about our premium membership
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  Can I cancel anytime?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Yes, you can cancel your premium subscription at any time. You'll continue to have access until the
                  end of your billing period with no additional charges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We accept all major credit cards and debit cards through our secure payment processor, Stripe. Your
                  payment information is always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  How much content is premium?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Authors can choose to make their best content premium. Typically, about 30% of articles are premium,
                  with the rest being free for everyone to enjoy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  Do authors get paid?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Yes! Premium subscriptions help support the writers and creators on our platform, encouraging
                  high-quality content and sustainable creator income.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}


