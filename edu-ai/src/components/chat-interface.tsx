import React, { useState, type FormEvent, useEffect, useRef, memo, useCallback } from "react"

// New UI + animation imports
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles, Code, Trash2, Send } from "lucide-react"

// Custom hook import (you'll need to convert this too)
import { useEducationalChat } from "@/hooks/use-educational-chat"

// Subtle typing dots indicator - memoized to prevent re-renders
const TypingDots = memo(function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">Assistant is typing</span>
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.2s]" />
    </div>
  )
})

// Memoized message bubble to prevent re-renders when typing
const MessageBubble = memo(function MessageBubble({
  role,
  message,
  stage,
  sources,
}: {
  role: "user" | "assistant"
  message: string
  stage?: string
  sources?: Array<{ content: string; metadata?: Record<string, any> }>
}) {
  const isUser = role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "flex max-w-[80%] items-start gap-3 rounded-2xl p-4 shadow-sm transition-all",
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-foreground border border-border/50",
        )}
        role="group"
        aria-label={isUser ? "Your message" : "Assistant message"}
      >
        {!isUser && (
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-offset-2 ring-blue-500/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
              AI
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-semibold", isUser ? "text-blue-100" : "text-muted-foreground")}>
              {isUser ? "You" : "Tutor"}
            </span>
            {!isUser && stage && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {stage}
              </Badge>
            )}
          </div>

          <div className={cn("whitespace-pre-wrap text-[15px] leading-relaxed break-words")}>{message}</div>

          {!isUser && sources && sources.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <div className="mb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Sources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sources.slice(0, 3).map((chunk, idx) => (
                  <Badge key={idx} variant="outline" className="text-[11px] font-normal">
                    📄 {(chunk.metadata?.filename || "unknown").toString().slice(0, 20)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {isUser && (
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-offset-2 ring-blue-400/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.div>
  )
})

export default function ChatInterface() {
  const [input, setInput] = useState<string>("")
  const [userId] = useState<string>(`user_${Date.now()}`)

  const { conversation, loading, error, allowDirectCode, sendMessage, clearHistory, toggleDirectCode } =
    useEducationalChat()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const conversationLengthRef = useRef(0)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!input.trim() || loading) return
      try {
        await sendMessage(input, userId)
        setInput("")
      } catch {
        // Hook manages error state
      }
    },
    [input, loading, sendMessage, userId],
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [handleSubmit],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Only scroll when conversation length ACTUALLY changes
  useEffect(() => {
    if (conversation.length !== conversationLengthRef.current) {
      conversationLengthRef.current = conversation.length
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 100)
    }
  }, [conversation.length])

  // Separate effect for loading state scroll
  useEffect(() => {
    if (loading && conversation.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 100)
    }
  }, [loading, conversation.length])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl">
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent md:text-3xl">
                    Socratic Tutor
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground pl-12">
                  Learn through guided questions and contextual sources
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                {userId.slice(-8)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={allowDirectCode}
                  onCheckedChange={toggleDirectCode}
                  aria-label="Toggle direct code mode"
                />
                <span className="text-xs font-medium">Direct Code</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                disabled={conversation.length === 0 && !error}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>

              {conversation.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {conversation.length} {conversation.length === 1 ? "message" : "messages"}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden shadow-inner">
              <ScrollArea className="h-[520px]" type="auto">
                <div className="p-4 space-y-4">
                  {conversation.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-[480px] text-center space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-medium text-foreground">Ready to learn?</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Ask any question to start an interactive learning session
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted transition-colors">
                          Explain Python functions
                        </Badge>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted transition-colors">
                          How do loops work?
                        </Badge>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted transition-colors">
                          What is recursion?
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                      {conversation.map((item, i) => (
                        <div key={`conversation-${i}`} className="space-y-4">
                          <MessageBubble role="user" message={item.question} />
                          <MessageBubble
                            role="assistant"
                            message={item.response.message}
                            stage={item.response.conversation_stage}
                            sources={item.response.retrieved_context}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  )}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      <div className="flex max-w-[80%] items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 shadow-sm">
                        <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-blue-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                            AI
                          </AvatarFallback>
                        </Avatar>
                        <TypingDots />
                        <span className="sr-only">Thinking…</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} className="h-px" />
                </div>
              </ScrollArea>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3.5 text-sm text-red-900 dark:text-red-200"
              >
                <span className="font-medium">Error:</span> {error}
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="pt-4 border-t border-border/50">
            <form onSubmit={handleSubmit} className="flex w-full items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask your question..."
                  className="pr-4 h-11 rounded-xl border-border/50 focus-visible:ring-blue-500"
                  disabled={loading}
                  aria-label="Message input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? "Sending..." : "Send"}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}