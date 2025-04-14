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
  }
  topic: {
    _id: string
    title: string
  }
  createdAt?: string
}

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment._id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-2">
              <Link href={`/forum/topic/${comment.topic._id}`} className="font-medium hover:underline">
                {comment.topic.title}
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
      ))}
    </div>
  )
}
