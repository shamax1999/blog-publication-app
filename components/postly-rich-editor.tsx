"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Smile,
  Search,
  Star,
  Heart,
  Zap,
  Crown,
  Target,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Coffee,
  Rocket,
  Trophy,
  Gift,
  Music,
  Camera,
  MapPin,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  Home,
  Settings,
  Download,
  Upload,
  Share,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

interface PostlyRichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Emoji categories with popular emojis
const emojiCategories = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
  ],
  Gestures: [
    "👍",
    "👎",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
  ],
  Hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "♥️",
  ],
  Objects: [
    "⭐",
    "🌟",
    "💫",
    "⚡",
    "🔥",
    "💎",
    "🎯",
    "🏆",
    "🎁",
    "🎉",
    "🎊",
    "🎈",
    "🎀",
    "🎂",
    "🍰",
    "🎵",
    "🎶",
    "📱",
    "💻",
    "⌚",
  ],
  Nature: [
    "🌞",
    "🌙",
    "⭐",
    "🌟",
    "🌈",
    "☀️",
    "⛅",
    "☁️",
    "🌤️",
    "⛈️",
    "🌦️",
    "🌧️",
    "❄️",
    "☃️",
    "⛄",
    "🌊",
    "💧",
    "🔥",
    "🌸",
    "🌺",
  ],
  Food: [
    "🍎",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥒",
  ],
  Travel: [
    "✈️",
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🛵",
    "🚲",
    "🛴",
    "🛹",
  ],
  Symbols: [
    "💯",
    "🔔",
    "🔕",
    "🎵",
    "🎶",
    "💤",
    "💢",
    "💬",
    "👁️‍🗨️",
    "🗨️",
    "🗯️",
    "💭",
    "🕳️",
    "👤",
    "👥",
    "🫂",
    "👣",
    "🧠",
    "🫀",
    "🫁",
  ],
}

// Lucide icons for content
const contentIcons = [
  { name: "Star", icon: Star, code: "⭐" },
  { name: "Heart", icon: Heart, code: "❤️" },
  { name: "Lightning", icon: Zap, code: "⚡" },
  { name: "Crown", icon: Crown, code: "👑" },
  { name: "Target", icon: Target, code: "🎯" },
  { name: "Check", icon: CheckCircle, code: "✅" },
  { name: "Alert", icon: AlertTriangle, code: "⚠️" },
  { name: "Idea", icon: Lightbulb, code: "💡" },
  { name: "Coffee", icon: Coffee, code: "☕" },
  { name: "Rocket", icon: Rocket, code: "🚀" },
  { name: "Trophy", icon: Trophy, code: "🏆" },
  { name: "Gift", icon: Gift, code: "🎁" },
  { name: "Music", icon: Music, code: "🎵" },
  { name: "Camera", icon: Camera, code: "📷" },
  { name: "Location", icon: MapPin, code: "📍" },
  { name: "Users", icon: Users, code: "👥" },
  { name: "Calendar", icon: Calendar, code: "📅" },
  { name: "Clock", icon: Clock, code: "🕐" },
  { name: "Mail", icon: Mail, code: "📧" },
  { name: "Phone", icon: Phone, code: "📞" },
  { name: "Home", icon: Home, code: "🏠" },
  { name: "Settings", icon: Settings, code: "⚙️" },
  { name: "Download", icon: Download, code: "⬇️" },
  { name: "Upload", icon: Upload, code: "⬆️" },
  { name: "Share", icon: Share, code: "📤" },
  { name: "Edit", icon: Edit, code: "✏️" },
  { name: "Delete", icon: Trash2, code: "🗑️" },
  { name: "Plus", icon: Plus, code: "➕" },
]

export function PostlyRichEditor({ value, onChange, placeholder, disabled, className }: PostlyRichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  const updateHistory = useCallback(
    (newValue: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const insertText = useCallback(
    (text: string) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + text + value.substring(end)

      onChange(newValue)
      updateHistory(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    },
    [value, onChange, updateHistory],
  )

  const wrapText = useCallback(
    (prefix: string, suffix: string = prefix) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      const newText = prefix + selectedText + suffix
      const newValue = value.substring(0, start) + newText + value.substring(end)

      onChange(newValue)
      updateHistory(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        if (selectedText) {
          textarea.setSelectionRange(start + prefix.length, end + prefix.length)
        } else {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length)
        }
      }, 0)
    },
    [value, onChange, updateHistory],
  )

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const lines = value.split("\n")
      let currentPos = 0
      let lineIndex = 0

      // Find which line the cursor is on
      for (let i = 0; i < lines.length; i++) {
        if (currentPos + lines[i].length >= start) {
          lineIndex = i
          break
        }
        currentPos += lines[i].length + 1 // +1 for newline
      }

      lines[lineIndex] = prefix + lines[lineIndex]
      const newValue = lines.join("\n")

      onChange(newValue)
      updateHistory(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
      }, 0)
    },
    [value, onChange, updateHistory],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [history, historyIndex, onChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [history, historyIndex, onChange])

  const insertEmoji = useCallback(
    (emoji: string) => {
      insertText(emoji)
      setShowEmojiPicker(false)
    },
    [insertText],
  )

  const insertIcon = useCallback(
    (iconCode: string) => {
      insertText(iconCode)
      setShowEmojiPicker(false)
    },
    [insertText],
  )

  const insertLink = useCallback(() => {
    if (linkText && linkUrl) {
      insertText(`[${linkText}](${linkUrl})`)
      setLinkText("")
      setLinkUrl("")
      setShowLinkDialog(false)
    }
  }, [linkText, linkUrl, insertText])

  const insertImage = useCallback(() => {
    if (imageUrl) {
      insertText(`![${imageAlt || "Image"}](${imageUrl})`)
      setImageUrl("")
      setImageAlt("")
      setShowImageDialog(false)
    }
  }, [imageUrl, imageAlt, insertText])

  // Filter emojis based on search
  const filteredEmojis = emojiSearch
    ? Object.entries(emojiCategories).reduce(
        (acc, [category, emojis]) => {
          const filtered = emojis.filter((emoji) => emoji.includes(emojiSearch.toLowerCase()))
          if (filtered.length > 0) {
            acc[category] = filtered
          }
          return acc
        },
        {} as Record<string, string[]>,
      )
    : emojiCategories

  // Filter icons based on search
  const filteredIcons = emojiSearch
    ? contentIcons.filter((icon) => icon.name.toLowerCase().includes(emojiSearch.toLowerCase()))
    : contentIcons

  return (
    <div
      className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300 ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
        {/* History */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={disabled || historyIndex === 0}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Undo className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={disabled || historyIndex === history.length - 1}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Redo className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("# ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Heading1 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("## ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Heading2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("### ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Heading3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapText("**")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Bold className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapText("*")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Italic className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapText("~~")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Strikethrough className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapText("`")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Code className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists and quotes */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("- ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <List className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("1. ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <ListOrdered className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("> ")}
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Quote className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Links and images */}
        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <LinkIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Insert Link</h4>
              <Input
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Input
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Button onClick={insertLink} className="w-full">
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showImageDialog} onOpenChange={setShowImageDialog}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Insert Image</h4>
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Input
                placeholder="Alt text (optional)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Button onClick={insertImage} className="w-full">
                Insert Image
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <Smile className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search emojis and icons..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <Tabs defaultValue="emojis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="emojis" className="text-gray-900 dark:text-white">
                    Emojis
                  </TabsTrigger>
                  <TabsTrigger value="icons" className="text-gray-900 dark:text-white">
                    Icons
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emojis">
                  <ScrollArea className="h-64">
                    {Object.entries(filteredEmojis).map(([category, emojis]) => (
                      <div key={category} className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{category}</h5>
                        <div className="grid grid-cols-8 gap-1">
                          {emojis.map((emoji, index) => (
                            <Button
                              key={`${category}-${index}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => insertEmoji(emoji)}
                              className="h-8 w-8 p-0 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="icons">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-4 gap-2">
                      {filteredIcons.map((icon) => (
                        <Button
                          key={icon.name}
                          variant="ghost"
                          size="sm"
                          onClick={() => insertIcon(icon.code)}
                          className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <icon.icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{icon.name}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          updateHistory(e.target.value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[400px] border-0 resize-none focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors duration-300"
        style={{ outline: "none", boxShadow: "none" }}
      />
    </div>
  )
}
