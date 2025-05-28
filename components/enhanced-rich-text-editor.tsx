"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link,
  Undo,
  Redo,
  Type,
  ImageIcon,
  Upload,
  X,
} from "lucide-react"
import { showError, showSuccess } from "@/lib/sweetalert"

interface EnhancedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EnhancedRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: EnhancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !disabled && !isInitialized) {
      // Set initial content
      editorRef.current.innerHTML = value || ""
      setIsEditorReady(true)
      setIsInitialized(true)
    }
  }, [value, disabled, isInitialized])

  // Handle content changes with proper cursor preservation
  const handleInput = useCallback(() => {
    if (editorRef.current && isEditorReady) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange, isEditorReady])

  // Preserve cursor position when executing commands
  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (disabled || !editorRef.current) return

      // Focus the editor first
      editorRef.current.focus()

      // Execute the command
      document.execCommand(command, false, value)

      // Trigger change event
      handleInput()
    },
    [disabled, handleInput],
  )

  const insertLink = useCallback(() => {
    if (disabled) return
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }, [disabled, execCommand])

  const formatBlock = useCallback(
    (tag: string) => {
      if (disabled) return
      execCommand("formatBlock", tag)
    },
    [disabled, execCommand],
  )

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Invalid File", "Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 5MB")
      return
    }

    setUploadingImage(true)

    try {
      // Convert image to base64 for demo purposes
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        insertImageAtCursor(base64, file.name)
        setUploadingImage(false)
        showSuccess("Image Uploaded", "Image has been added to your post")
      }
      reader.onerror = () => {
        setUploadingImage(false)
        showError("Upload Failed", "Failed to process the image")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setUploadingImage(false)
      showError("Upload Failed", "Failed to upload the image")
    }
  }

  const insertImageAtCursor = useCallback(
    (src: string, alt = "") => {
      if (disabled || !editorRef.current) return

      // Focus the editor
      editorRef.current.focus()

      // Create image HTML
      const img = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`

      // Insert image using execCommand for better compatibility
      execCommand("insertHTML", img)
    },
    [disabled, execCommand],
  )

  const insertImageFromUrl = useCallback(() => {
    if (!imageUrl.trim()) {
      showError("Invalid URL", "Please enter a valid image URL")
      return
    }

    insertImageAtCursor(imageUrl, "Image")
    setImageUrl("")
    setShowImageDialog(false)
    showSuccess("Image Added", "Image has been added to your post")
  }, [imageUrl, insertImageAtCursor])

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle paste events to maintain proper formatting
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return

      e.preventDefault()
      const text = e.clipboardData.getData("text/plain")
      execCommand("insertText", text)
    },
    [disabled, execCommand],
  )

  // Handle key events for better text input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      // Handle common shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            execCommand("bold")
            break
          case "i":
            e.preventDefault()
            execCommand("italic")
            break
          case "z":
            e.preventDefault()
            execCommand("undo")
            break
          case "y":
            e.preventDefault()
            execCommand("redo")
            break
        }
      }
    },
    [disabled, execCommand],
  )

  if (disabled) {
    return (
      <div className={className}>
        <div
          className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          dangerouslySetInnerHTML={{ __html: value || placeholder || "" }}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
          }
        }}
        className="hidden"
      />

      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Image from URL</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowImageDialog(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl" className="text-gray-900 dark:text-white">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertImageFromUrl} className="flex-1">
                  Add Image
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-md bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock("h1")}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock("h2")}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock("p")}
          className="h-8 w-8 p-0"
          title="Paragraph"
        >
          <Type className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
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
          onClick={() => formatBlock("blockquote")}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Image buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={triggerFileUpload}
          disabled={uploadingImage}
          className="h-8 w-8 p-0"
          title="Upload Image"
        >
          {uploadingImage ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          className="h-8 w-8 p-0"
          title="Insert Image from URL"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("undo")}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("redo")}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-sm max-w-none dark:prose-invert"
        style={{
          minHeight: "400px",
        }}
        data-placeholder={placeholder || "Start writing your content..."}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          line-height: 1.2;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          line-height: 1.3;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}
