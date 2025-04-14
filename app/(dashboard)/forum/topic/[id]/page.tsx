"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, ArrowLeft, Send, MessageSquare } from "lucide-react"
import CommentItem from "@/components/forum/comment-item"
import { useTopic, useComments, useCreateComment, useDeleteComment } from "@/hooks/use-forum-data"
import { useEffect } from "react"

export default function TopicDetailPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.id as string

  const [newComment, setNewComment] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  const { data: topic, isLoading: isLoadingTopic, error: topicError } = useTopic(topicId)

  const { data: comments = [], isLoading: isLoadingComments, error: commentsError } = useComments(topicId)

  const createCommentMutation = useCreateComment()
  const deleteCommentMutation = useDeleteComment()

  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("userData")
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)
      }
    } catch (e) {
      console.error("Error parsing user data:", e)
    }
  }, [])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await createCommentMutation.mutateAsync({
        content: newComment,
        topicId,
      })
      setNewComment("")
    } catch (error) {
      console.error("Error creating comment:", error)
    }
  }

  const handleCreateReply = async (content: string, parentId: string) => {
    try {
      await createCommentMutation.mutateAsync({
        content,
        topicId,
        parentId,
      })
      return Promise.resolve()
    } catch (error) {
      console.error("Error creating reply:", error)
      return Promise.reject(error)
    }
  }

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return

    try {
      await deleteCommentMutation.mutateAsync({
        commentId: commentToDelete,
        topicId,
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert((error as Error).message || "Đã xảy ra lỗi khi xóa bình luận")
    } finally {
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  const isLoading = isLoadingTopic || isLoadingComments
  const error = topicError || commentsError

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Đang tải...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mx-auto max-w-2xl">
          <AlertDescription>{(error as Error).message || "Đã xảy ra lỗi khi tải dữ liệu"}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/forum")}>Quay lại diễn đàn</Button>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="mx-auto max-w-2xl">
          <AlertDescription>Không tìm thấy chủ đề</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/forum")}>Quay lại diễn đàn</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/forum")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại diễn đàn
      </Button>

      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{topic.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      {typeof topic.author !== "string" && topic.author?.avatar ? (
                        <AvatarImage src={topic.author.avatar || ""} alt={topic.author.username} />
                      ) : (
                        <AvatarFallback>
                          {typeof topic.author !== "string" && topic.author?.username
                            ? getInitials(topic.author.username)
                            : "UN"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{typeof topic.author !== "string" ? topic.author?.username : "Người dùng ẩn danh"}</span>
                  </div>
                  <span>•</span>
                  <div>
                    {topic.createdAt
                      ? formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })
                      : "Vừa đăng"}
                  </div>
                </CardDescription>
              </div>
            </div>
            {topic.tags && topic.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <p className="whitespace-pre-line">{topic.content}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bình luận ({comments.length})</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              {createCommentMutation.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {(createCommentMutation.error as Error).message || "Đã xảy ra lỗi khi gửi bình luận"}
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Viết bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createCommentMutation.isPending || !newComment.trim()}>
                    {createCommentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Gửi bình luận
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium">Chưa có bình luận nào</h3>
              <p className="text-sm text-gray-500">Hãy là người đầu tiên bình luận về chủ đề này</p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      currentUserId={userData?._id}
                      onReply={handleCreateReply}
                      onDelete={openDeleteDialog}
                      isDeleting={deleteCommentMutation.isPending}
                      deletingCommentId={commentToDelete}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog xác nhận xóa bình luận */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này không? Tất cả các trả lời của bình luận này cũng sẽ bị xóa. Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteComment} className="bg-red-600 hover:bg-red-700">
              Xóa bình luận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
