import { useQuery } from "@tanstack/react-query"
import { API_USER_PROFILE, API_USER_TOPICS, API_USER_COMMENTS } from "@/configs/api-config"

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Hook lấy thông tin profile của user
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_USER_PROFILE}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      return await response.json()
    },
    enabled: !!userId, 
  })
}

// Hook lấy tất cả bài đăng của user
export function useUserTopics(userId: string | null) {
  return useQuery({
    queryKey: ["userTopics", userId],
    queryFn: async () => {
      if (!userId) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_USER_TOPICS}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user topics")
      }

      return await response.json()
    },
    enabled: !!userId, 
  })
}

// Hook lấy tất cả bình luận của user
export function useUserComments(userId: string | null) {
  return useQuery({
    queryKey: ["userComments", userId],
    queryFn: async () => {
      if (!userId) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_USER_COMMENTS}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user comments")
      }

      return await response.json()
    },
    enabled: !!userId,
  })
}
