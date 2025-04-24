"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, MessageSquare, FileText, Clock } from "lucide-react"
import TopicList from "@/components/forum/topic-list"
import CommentList from "@/components/forum/comment-list"
import { useUserProfile, useUserTopics, useUserComments } from "@/hooks/use-user-profile"

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [activeTab, setActiveTab] = useState("topics")

  // Lấy dữ liệu từ API
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useUserProfile(userId)

  const { data: topics = [], isLoading: isLoadingTopics, error: topicsError } = useUserTopics(userId)

  const { data: comments = [], isLoading: isLoadingComments, error: commentsError } = useUserComments(userId)

  // Xử lý loading state
  const isLoading = isLoadingProfile || isLoadingTopics || isLoadingComments
  const error = profileError || topicsError || commentsError

  // Lấy chữ cái đầu của tên người dùng
  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || "UN"
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Đang tải thông tin người dùng...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Lỗi</CardTitle>
            <CardDescription>Không thể tải thông tin người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{(error as Error).message}</p>
            <Button onClick={() => router.push("/forum")} className="mt-4">
              Quay lại diễn đàn
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Không tìm thấy</CardTitle>
            <CardDescription>Không tìm thấy thông tin người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/forum")} className="mt-4">
              Quay lại diễn đàn
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, stats } = profileData

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/forum")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại diễn đàn
      </Button>

      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
              <Avatar className="h-24 w-24">
                {user.avatar ? (
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                ) : (
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <CardDescription className="mt-1">
                  Thành viên từ{" "}
                  {user.createdAt
                    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: vi })
                    : "không rõ"}
                </CardDescription>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex items-center rounded-md border p-2">
                    <FileText className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{stats?.topicsCount || 0} bài viết</span>
                  </div>
                  <div className="flex items-center rounded-md border p-2">
                    <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">{stats?.commentsCount || 0} bình luận</span>
                  </div>
                  <div className="flex items-center rounded-md border p-2">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Hoạt động{" "}
                      {stats?.lastActivity
                        ? formatDistanceToNow(new Date(stats.lastActivity), { addSuffix: true, locale: vi })
                        : "không rõ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="topics">Bài viết</TabsTrigger>
                <TabsTrigger value="comments">Bình luận</TabsTrigger>
              </TabsList>
              <TabsContent value="topics">
                {topics && topics.length > 0 ? (
                  <TopicList topics={topics} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mb-2 h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
                    <p className="text-sm text-gray-500">Người dùng này chưa đăng bài viết nào</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="comments">
                {comments && comments.length > 0 ? (
                  <CommentList comments={comments} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium">Chưa có bình luận nào</h3>
                    <p className="text-sm text-gray-500">Người dùng này chưa bình luận bài viết nào</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
