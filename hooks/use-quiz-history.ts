import { useQuery } from "@tanstack/react-query"
import { API_HISTORY_TAKE_QUIZ_BY_UID } from "@/configs/api-config"

export interface QuizSession {
  _id: string
  userId: string
  testId:
    | string
    | {
        _id: string
        name?: string
        title?: string
        image?: string
        questions?: any[]
      } 
  answers: Array<any>
  correctAnswersCount: number
  incorrectAnswersCount: number
  createdAt: string
  updatedAt: string
}

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Hook lấy lịch sử làm quiz của user
export function useQuizHistory(userId: string | null) {
  return useQuery({
    queryKey: ["quizHistory", userId],
    queryFn: async () => {
      if (!userId) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      try {
        console.log(`Fetching quiz history for user ID: ${userId}`)
        const response = await fetch(`${API_HISTORY_TAKE_QUIZ_BY_UID}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Quiz history fetch failed with status ${response.status}: ${errorText}`)
          throw new Error(`Failed to fetch quiz history: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Quiz history response:", data)
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.error("Error fetching quiz history:", error)
        throw error
      }
    },
    enabled: !!userId, 
  })
}
