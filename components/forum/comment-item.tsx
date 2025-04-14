"use client"

import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Trash2, Reply, ChevronDown, ChevronUp } from "lucide-react"
import type { Comment } from "@/types/forum"

interface CommentItemProps {
  comment: Comment
  level?: number
  currentUserId?: string
  onReply: (content: string, parentId: string) => Promise<void>
  onDelete: (commentId: string) => void
  isDeleting: boolean
  deletingCommentId: string | null
}

export default function CommentItem({
  comment,
  level = 0,
  currentUserId,
  onReply,
  onDelete,
  isDeleting,
  deletingCommentId,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const hasReplies = comment.replies && comment.replies.length > 0
  const isAuthor =
    currentUserId &&
    (typeof comment.author !== "string" ? comment.author?._id === currentUserId : comment.author === currentUserId)

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  const getAuthorName = () => {
    if (typeof comment.author !== "string" && comment.author?.username) {
      return comment.author.username
    }
    return "Người dùng ẩn danh"
  }

  const getAuthorAvatar = () => {
    if (typeof comment.author !== "string" && comment.author?.avatar) {
      return comment.author.avatar
    }
    return null
  }

  const getAuthorId = () => {
    if (typeof comment.author !== "string" && comment.author?._id) {
      return comment.author._id
    }
    return null
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await onReply(replyContent, comment._id)
      setReplyContent("")
      setIsReplying(false)
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`pl-${level > 0 ? 6 : 0}`}>
      <div className="flex space-x-4">
        {getAuthorId() ? (
          <Link href={`/user/${getAuthorId()}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1">
              {getAuthorAvatar() ? (
                <AvatarImage src={getAuthorAvatar() || ""} alt={getAuthorName()} />
              ) : (
                <AvatarFallback>{getAuthorName() ? getInitials(getAuthorName()) : "UN"}</AvatarFallback>
              )}
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-10 w-10">
            {getAuthorAvatar() ? (
              <AvatarImage src={getAuthorAvatar() || ""} alt={getAuthorName()} />
            ) : (
              <AvatarFallback>{getAuthorName() ? getInitials(getAuthorName()) : "UN"}</AvatarFallback>
            )}
          </Avatar>
        )}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{getAuthorName()}</span>
              <span className="text-sm text-gray-500">
                {comment.createdAt
                  ? formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })
                  : "Vừa đăng"}
              </span>
            </div>
            <div className="flex space-x-1">
              {level === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="h-8 text-gray-500 hover:text-gray-700"
                >
                  <Reply className="mr-1 h-4 w-4" />
                  Trả lời
                </Button>
              )}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(comment._id)}
                  disabled={isDeleting && deletingCommentId === comment._id}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  {isDeleting && deletingCommentId === comment._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>
          <p className="whitespace-pre-line">{comment.content}</p>

          {isReplying && (
            <div className="mt-3 space-y-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm font-medium">Trả lời bình luận của {getAuthorName()}</p>
              <Textarea
                placeholder="Viết trả lời của bạn..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleReplySubmit} disabled={isSubmitting || !replyContent.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gửi
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasReplies && (
        <div className="mt-2 pl-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="mb-2 text-sm text-gray-500"
          >
            {showReplies ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Ẩn {comment.replies?.length} trả lời
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Hiện {comment.replies?.length} trả lời
              </>
            )}
          </Button>

          {showReplies && (
            <div className="space-y-4">
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  level={level + 1}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                  deletingCommentId={deletingCommentId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
