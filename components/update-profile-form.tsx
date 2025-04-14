"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_UPDATE_PROFILE } from "@/configs/api-config"
import { notifyUserDataChange } from "../untils/events"

interface UpdateProfileFormProps {
  userData: any
  setUserData: (data: any) => void
}

export default function UpdateProfileForm({ userData, setUserData }: UpdateProfileFormProps) {
  const [username, setUsername] = useState(userData.username || "")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userData.avatar || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)

      // Tạo preview cho avatar
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!username.trim()) {
      setError("Tên người dùng không được để trống")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Bạn chưa đăng nhập")
      }

      const formData = new FormData()
      formData.append("username", username)
      if (avatar) {
        formData.append("avatar", avatar)
      }

      const response = await fetch(`${API_UPDATE_PROFILE}/${userData._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Cập nhật thất bại")
      }

      setSuccess("Cập nhật thông tin thành công")

      if (data.updatedUser) {
        setUserData(data.updatedUser)
        localStorage.setItem("userData", JSON.stringify(data.updatedUser))
        if (data.updatedUser.avatar) {
          localStorage.setItem("userAvatar", data.updatedUser.avatar)

          notifyUserDataChange()
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 relative">
          <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Avatar preview" />
            ) : (
              <AvatarFallback>{getInitials(username)}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-white">
            <Upload className="h-4 w-4" />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
          aria-label="Upload avatar"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">Nhấp vào để thay đổi avatar</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Tên người dùng</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Nhập tên người dùng"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={userData.email} disabled className="bg-gray-100 dark:bg-gray-800" />
        <p className="text-xs text-gray-500">Email không thể thay đổi</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          "Cập nhật thông tin"
        )}
      </Button>
    </form>
  )
}
