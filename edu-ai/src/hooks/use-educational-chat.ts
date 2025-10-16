import { useState, useCallback } from "react"
import type { TeachResponse, UseEducationalChatReturn, ConversationItem } from "@/types/educational-types"

export const useEducationalChat = (): UseEducationalChatReturn => {
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [allowDirectCode, setAllowDirectCode] = useState<boolean>(false)

  const sendMessage = useCallback(
    async (query: string, userId = "default_user"): Promise<TeachResponse> => {
      setLoading(true)
      setError(null)

      try {
        // Create history summary from recent conversation
        const historySummary =
          conversation.length > 0
            ? `Recent conversation: ${conversation
                .slice(-3)
                .map((item) => `Q: ${item.question} A: ${item.response.message.substring(0, 50)}...`)
                .join("; ")}`
            : undefined

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            userId,
            allowDirectCode,
            historySummary,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `API error: ${response.status}`)
        }

        const data: TeachResponse = await response.json()

        // Add to conversation
        setConversation((prev) => [...prev, { question: query, response: data }])

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [conversation, allowDirectCode],
  )

  const clearHistory = useCallback(() => {
    setConversation([])
    setError(null)
  }, [])

  const toggleDirectCode = useCallback(() => {
    setAllowDirectCode((prev) => !prev)
  }, [])

  return {
    conversation,
    loading,
    error,
    allowDirectCode,
    sendMessage,
    clearHistory,
    toggleDirectCode,
  }
}