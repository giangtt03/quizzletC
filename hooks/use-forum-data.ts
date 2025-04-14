import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  API_TOPICS,
  API_TOPIC_BY_ID,
  API_TOPIC_BY_TAG,
  API_SEARCH_TOPICS,
  API_COMMENT_TREE,
  API_CREATE_COMMENT,
  API_DELETE_COMMENT,
} from "@/configs/api-config"

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Hook lấy tất cả chủ đề
export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(API_TOPICS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch topics")
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
  })
}

// Hook lấy chủ đề theo tag
export function useTopicsByTag(tag: string | null) {
  return useQuery({
    queryKey: ["topics", "tag", tag],
    queryFn: async () => {
      if (!tag) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_TOPIC_BY_TAG}/${tag}?populate=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch topics for tag: ${tag}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
    enabled: !!tag, 
  })
}

// Hook lấy chủ đề theo ID
export function useTopic(topicId: string | null) {
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      if (!topicId) return null

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_TOPIC_BY_ID}/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch topic")
      }

      return await response.json()
    },
    enabled: !!topicId,
  })
}

// Hook lấy comments của chủ đề
export function useComments(topicId: string | null) {
  return useQuery({
    queryKey: ["comments", topicId],
    queryFn: async () => {
      if (!topicId) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_COMMENT_TREE}/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
    enabled: !!topicId,
  })
}

// Hook tạo comment mới
export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ content, topicId, parentId }: { content: string; topicId: string; parentId?: string }) => {
      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(API_CREATE_COMMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          topicId,
          parentId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create comment")
      }

      return await response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.topicId] })
    },
  })
}

// Hook xóa comment
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, topicId }: { commentId: string; topicId: string }) => {
      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_DELETE_COMMENT}/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      return commentId
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.topicId] })
    },
  })
}

export function useSearchTopics(query: string) {
  return useQuery({
    queryKey: ["topics", "search", query],
    queryFn: async () => {
      if (!query.trim()) return []

      const token = getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await fetch(`${API_SEARCH_TOPICS}?title=${encodeURIComponent(query)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to search topics")
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
    enabled: !!query.trim(),
  })
}
