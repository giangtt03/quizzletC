import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"
import type { Topic } from "@/types/forum"

interface TopicListProps {
  topics: Topic[]
}

export default function TopicList({ topics }: TopicListProps) {
  // Lọc ra các topic có dữ liệu hợp lệ
  const validTopics = topics.filter((topic) => topic && topic._id)

  // Hàm lấy chữ cái đầu của tên người dùng
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  // Lấy avatar của tác giả
  const getAuthorAvatar = (topic: Topic) => {
    if (typeof topic.author !== "string" && topic.author?.avatar) {
      return topic.author.avatar
    }
    return null
  }

  // Lấy tên tác giả
  const getAuthorName = (topic: Topic) => {
    if (typeof topic.author !== "string" && topic.author?.username) {
      return topic.author.username
    }
    return "Người dùng ẩn danh"
  }

  // Lấy ID của tác giả
  const getAuthorId = (topic: Topic) => {
    if (typeof topic.author !== "string" && topic.author?._id) {
      return topic.author._id
    }
    return null
  }

  if (validTopics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
        <p className="text-sm text-gray-500">Người dùng này chưa đăng bài viết nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {validTopics.map((topic) => (
        <div
          key={topic._id}
          className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="w-full">
              <Link href={`/forum/topic/${topic._id}`} className="hover:underline">
                <h3 className="font-medium">{topic.title}</h3>
              </Link>
              <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  {getAuthorId(topic) ? (
                    <Link href={`/user/${getAuthorId(topic)}`}>
                      <Avatar className="h-5 w-5 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1">
                        {getAuthorAvatar(topic) ? (
                          <AvatarImage src={getAuthorAvatar(topic) || ""} alt={getAuthorName(topic)} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {getAuthorName(topic) ? getInitials(getAuthorName(topic)) : "UN"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar className="h-5 w-5">
                      {getAuthorAvatar(topic) ? (
                        <AvatarImage src={getAuthorAvatar(topic) || ""} alt={getAuthorName(topic)} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getAuthorName(topic) ? getInitials(getAuthorName(topic)) : "UN"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  <span>{getAuthorName(topic)}</span>
                </div>
                <span>•</span>
                <div>
                  {topic.createdAt
                    ? formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })
                    : "Vừa đăng"}
                </div>
                {topic.comments && topic.comments.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      <span>{topic.comments.length} bình luận</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {topic.tags && topic.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {topic.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
