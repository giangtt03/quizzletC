import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    avatar?: string
  } | null
  topic: {
    _id: string
    title: string
  } | null
  createdAt?: string
}

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  // Lọc ra các comment có dữ liệu hợp lệ
  const validComments = comments.filter(
    (comment) => comment && comment.topic && comment.topic._id && comment.topic.title,
  )

  return (
    <div className="space-y-4">
      {validComments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
            <h3 className="mb-1 text-lg font-medium">Không có bình luận</h3>
            <p className="text-sm text-gray-500">Người dùng này chưa có bình luận nào</p>
          </CardContent>
        </Card>
      ) : (
        validComments.map((comment) => (
          <Card key={comment._id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="mb-2">
                <Link href={`/forum/topic/${comment.topic?._id}`} className="font-medium hover:underline">
                  {comment.topic?.title || "Chủ đề không xác định"}
                </Link>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="mt-1 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="whitespace-pre-line text-sm">{comment.content}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })
                        : "Vừa đăng"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
