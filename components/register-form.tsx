"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_REGISTER } from "@/configs/api-config"

export default function RegisterForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)

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

    if (!username || !email || !password || !confirmPassword || !avatar) {
      setError("Vui lòng điền đầy đủ thông tin và chọn avatar")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Định dạng email không hợp lệ")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("avatar", avatar)

      const response = await fetch(API_REGISTER, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Đăng ký thất bại")
      }

      router.push("/")
    } catch (err) {
      console.error("Error registering:", err)
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 relative">
          <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Avatar preview" />
            ) : (
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                <Upload className="h-8 w-8 text-gray-500" />
              </AvatarFallback>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Nhấp vào để tải lên avatar</p>
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
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Nhập địa chỉ email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng ký...
          </>
        ) : (
          "Đăng ký"
        )}
      </Button>

      <div className="text-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  )
}
