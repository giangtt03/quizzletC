"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { API_CREATE_TOPIC } from "@/configs/api-config"

export default function CreateTopicPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const token = localStorage.getItem("authToken")

    if (!token) {
      router.push("/")
      return
    }

    try {
      // Convert
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await fetch(API_CREATE_TOPIC, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create topic")
      }

      const data = await response.json()
      router.push(`/forum/topic/${data._id}`)
    } catch (err) {
      console.error("Error creating topic:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/forum")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại diễn đàn
      </Button>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Tạo chủ đề mới</CardTitle>
          <CardDescription>Chia sẻ câu hỏi hoặc kiến thức của bạn với cộng đồng</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nhập tiêu đề chủ đề"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Nhập nội dung chi tiết"
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Thẻ (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ví dụ: javascript, react, nextjs"
              />
              <p className="text-xs text-gray-500">Thêm các thẻ liên quan để người khác dễ tìm thấy chủ đề của bạn</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo chủ đề"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
