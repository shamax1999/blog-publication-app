"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Undo,
  Redo,
  Type,
  ImageIcon,
  Upload,
  X,
  Smile,
  Heart,
  Star,
  Zap,
  Crown,
  FlameIcon as Fire,
  Sparkles,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Coffee,
  Rocket,
  Trophy,
  Gift,
  Music,
  Camera,
  MapPin,
  Users,
  MessageCircle,
  ThumbsUp,
  Eye,
  Bookmark,
  Share,
  Download,
  Settings,
  Search,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Mail,
  Phone,
  Globe,
  Database,
  Code,
  Terminal,
  Trash2,
  Edit,
  Save,
  Volume2,
  Play,
  Pause,
} from "lucide-react"
import { showError, showSuccess } from "@/lib/sweetalert"

interface UnlimitedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Icon categories for easy selection
const iconCategories = {
  emotions: [
    { icon: Smile, name: "smile" },
    { icon: Heart, name: "heart" },
    { icon: Star, name: "star" },
    { icon: Fire, name: "fire" },
    { icon: Sparkles, name: "sparkles" },
    { icon: Crown, name: "crown" },
    { icon: Trophy, name: "trophy" },
    { icon: Gift, name: "gift" },
  ],
  actions: [
    { icon: Zap, name: "zap" },
    { icon: Target, name: "target" },
    { icon: CheckCircle, name: "check-circle" },
    { icon: AlertCircle, name: "alert-circle" },
    { icon: Info, name: "info" },
    { icon: Lightbulb, name: "lightbulb" },
    { icon: Rocket, name: "rocket" },
    { icon: Coffee, name: "coffee" },
  ],
  media: [
    { icon: Music, name: "music" },
    { icon: Camera, name: "camera" },
    { icon: Play, name: "play" },
    { icon: Pause, name: "pause" },
    { icon: Volume2, name: "volume" },
    { icon: Eye, name: "eye" },
    { icon: Download, name: "download" },
    { icon: Upload, name: "upload" },
  ],
  navigation: [
    { icon: ArrowRight, name: "arrow-right" },
    { icon: ArrowLeft, name: "arrow-left" },
    { icon: ArrowUp, name: "arrow-up" },
    { icon: ArrowDown, name: "arrow-down" },
    { icon: ChevronRight, name: "chevron-right" },
    { icon: ChevronLeft, name: "chevron-left" },
    { icon: Home, name: "home" },
    { icon: MapPin, name: "map-pin" },
  ],
  communication: [
    { icon: Mail, name: "mail" },
    { icon: Phone, name: "phone" },
    { icon: MessageCircle, name: "message" },
    { icon: Users, name: "users" },
    { icon: ThumbsUp, name: "thumbs-up" },
    { icon: Share, name: "share" },
    { icon: Bookmark, name: "bookmark" },
    { icon: Globe, name: "globe" },
  ],
  tools: [
    { icon: Settings, name: "settings" },
    { icon: Search, name: "search" },
    { icon: Edit, name: "edit" },
    { icon: Save, name: "save" },
    { icon: Trash2, name: "trash" },
    { icon: Code, name: "code" },
    { icon: Terminal, name: "terminal" },
    { icon: Database, name: "database" },
  ],
}

export function UnlimitedRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: UnlimitedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showIconDialog, setShowIconDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedIconCategory, setSelectedIconCategory] = useState<keyof typeof iconCategories>("emotions")
  const [contentStats, setContentStats] = useState({ words: 0, characters: 0, readingTime: 0 })

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !disabled && !isInitialized) {
      editorRef.current.innerHTML = value || ""
      setIsEditorReady(true)
      setIsInitialized(true)
      updateContentStats(value)
    }
  }, [value, disabled, isInitialized])

  // Update content statistics
  const updateContentStats = useCallback((content: string) => {
    const textContent = content.replace(/<[^>]*>/g, "")
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
    const characters = textContent.length
    const readingTime = Math.max(1, Math.ceil(words / 200))

    setContentStats({ words, characters, readingTime })
  }, [])

  // Handle content changes with proper cursor preservation
  const handleInput = useCallback(() => {
    if (editorRef.current && isEditorReady) {
      const content = editorRef.current.innerHTML
      onChange(content)
      updateContentStats(content)
    }
  }, [onChange, isEditorReady, updateContentStats])

  // Preserve cursor position when executing commands
  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (disabled || !editorRef.current) return

      editorRef.current.focus()
      document.execCommand(command, false, value)
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

    if (!file.type.startsWith("image/")) {
      showError("Invalid File", "Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 10MB")
      return
    }

    setUploadingImage(true)

    try {
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

      editorRef.current.focus()
      const img = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`
      execCommand("insertHTML", img)
    },
    [disabled, execCommand],
  )

  const insertIcon = useCallback(
    (iconName: string) => {
      if (disabled || !editorRef.current) return

      editorRef.current.focus()
      // Insert icon as a styled span with data attribute for easy identification
      const iconHtml = `<span class="editor-icon" data-icon="${iconName}" style="display: inline-flex; align-items: center; margin: 0 2px; padding: 2px 4px; background: #f3f4f6; border-radius: 4px; font-size: 14px;">📍</span>`
      execCommand("insertHTML", iconHtml)
      setShowIconDialog(false)
      showSuccess("Icon Added", `${iconName} icon has been added to your post`)
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

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return

      // Handle large paste operations
      const items = e.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            handleImageUpload(blob)
          }
          return
        }
      }

      // For text, let the default behavior handle it
      setTimeout(() => {
        handleInput()
      }, 0)
    },
    [disabled, handleInput],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

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
          case "u":
            e.preventDefault()
            execCommand("underline")
            break
          case "z":
            e.preventDefault()
            execCommand("undo")
            break
          case "y":
            e.preventDefault()
            execCommand("redo")
            break
          case "s":
            e.preventDefault()
            // Trigger save (you can emit an event here)
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

      {/* Icon Selection Dialog */}
      {showIconDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Icon</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowIconDialog(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Icon Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(iconCategories).map((category) => (
                <Button
                  key={category}
                  variant={selectedIconCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIconCategory(category as keyof typeof iconCategories)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-8 gap-2">
              {iconCategories[selectedIconCategory].map(({ icon: IconComponent, name }) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertIcon(name)}
                  className="h-12 w-12 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title={name}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Statistics */}
      <div className="flex items-center gap-4 mb-2 text-sm text-gray-500 dark:text-gray-400">
        <Badge variant="outline" className="text-xs">
          {contentStats.words} words
        </Badge>
        <Badge variant="outline" className="text-xs">
          {contentStats.characters} characters
        </Badge>
        <Badge variant="outline" className="text-xs">
          {contentStats.readingTime} min read
        </Badge>
      </div>

      {/* Toolbar */}
      <div className="border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-md bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        {/* Headings */}
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
          onClick={() => formatBlock("h3")}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
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

        {/* Text Formatting */}
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

        {/* Lists */}
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

        {/* Special Elements */}
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

        {/* Media */}
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowIconDialog(true)}
          className="h-8 w-8 p-0"
          title="Insert Icon"
        >
          <Smile className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
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
        className="min-h-[500px] max-h-[800px] overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-sm max-w-none dark:prose-invert"
        style={{
          minHeight: "500px",
          maxHeight: "800px",
        }}
        data-placeholder={placeholder || "Start writing your unlimited content..."}
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
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
          color: #1f2937;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
          color: #374151;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
          color: #4b5563;
        }
        [contenteditable] p {
          margin: 0.75rem 0;
          line-height: 1.7;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        [contenteditable] .editor-icon {
          display: inline-flex;
          align-items: center;
          margin: 0 2px;
          padding: 2px 4px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 14px;
          vertical-align: middle;
        }
        [contenteditable]:focus {
          outline: none;
        }
        /* Handle very long content */
        [contenteditable] {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        /* Improve readability for long content */
        [contenteditable] p {
          max-width: none;
        }
      `}</style>
    </div>
  )
}
