"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Mail, Calendar, Edit } from "lucide-react"
import { API_GET_USER } from "@/configs/api-config"
import UpdateProfileForm from "@/components/update-profile-form"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { notifyUserDataChange } from "../../../untils/events"

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        router.push("/")
        return
      }

      try {
        const storedUserData = localStorage.getItem("userData")
        if (!storedUserData) {
          throw new Error("User data not found")
        }

        const parsedUserData = JSON.parse(storedUserData)
        const userId = parsedUserData._id

        const response = await fetch(`${API_GET_USER}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserData(data)

        localStorage.setItem("userData", JSON.stringify(data))
        if (data.avatar) {
          localStorage.setItem("userAvatar", data.avatar)
          notifyUserDataChange()
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleUpdateUserData = (newUserData: any) => {
    setUserData(newUserData)
    notifyUserDataChange()
  }

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  if (loading) {
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
            <p className="text-red-500">{error}</p>
            <Button onClick={() => router.push("/quizzes")} className="mt-4">
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Không tìm thấy thông tin</CardTitle>
            <CardDescription>Không thể tìm thấy thông tin người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/quizzes")} className="mt-4">
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
              <Avatar className="h-24 w-24">
                {userData.avatar ? (
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.username} />
                ) : (
                  <AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-2xl">{userData.username}</CardTitle>
                <CardDescription className="mt-1">
                  Thành viên từ{" "}
                  {userData.createdAt
                    ? formatDistanceToNow(new Date(userData.createdAt), { addSuffix: true, locale: vi })
                    : "không rõ"}
                </CardDescription>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("edit")} className="gap-1">
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa hồ sơ
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="edit">Chỉnh sửa hồ sơ</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tên người dùng</p>
                        <p>{userData.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p>{userData.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                        <p>
                          {userData.createdAt
                            ? new Date(userData.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Không rõ"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="edit">
                <UpdateProfileForm userData={userData} setUserData={handleUpdateUserData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
