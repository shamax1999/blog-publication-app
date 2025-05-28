import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      <Card className="w-full max-w-md text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-300">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center transition-colors duration-300">
            <FileQuestion className="h-8 w-8 text-gray-400 dark:text-gray-300" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Post Not Found
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            The post you're looking for doesn't exist or may have been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/posts">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Posts
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
