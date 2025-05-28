"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function SearchPosts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/posts?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/posts")
    }
  }

  const clearSearch = () => {
    setQuery("")
    router.push("/posts")
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="submit">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
