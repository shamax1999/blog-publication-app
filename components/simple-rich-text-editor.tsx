"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Link, Eye, Code } from "lucide-react"

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SimpleRichTextEditor({ value, onChange, placeholder, disabled, className }: SimpleRichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPreview, setIsPreview] = useState(false)

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current || disabled) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        const newCursorPos = start + before.length + selectedText.length + after.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current || disabled) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const newText = value.substring(0, start) + text + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        const newCursorPos = start + text.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const formatMarkdown = (text: string) => {
    return text
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

  if (disabled) {
    return (
      <div className={className}>
        <div
          className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(value || placeholder || "") }}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-md bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("# ", "")}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("## ", "")}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("**", "**")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("*", "*")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("`", "`")}
          className="h-8 w-8 p-0"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor("- ")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor("1. ")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("&gt; ", "")}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter URL:")
            const text = prompt("Enter link text:")
            if (url && text) {
              insertAtCursor(`[${text}](${url})`)
            }
          }}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 w-8 p-0"
          title="Toggle Preview"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <div
          className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white prose prose-sm max-w-none dark:prose-invert overflow-auto"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(value) }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Start writing your content using Markdown..."}
          disabled={disabled}
          className="min-h-[400px] border-gray-300 dark:border-gray-600 rounded-b-md rounded-t-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ minHeight: "400px" }}
        />
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>Markdown supported:</strong> **bold**, *italic*, `code`, # heading, - list, &gt; quote, [link](url)
        </p>
      </div>
    </div>
  )
}
