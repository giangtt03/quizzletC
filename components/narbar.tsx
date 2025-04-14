"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, History, MessageSquare, Heart, Menu, LogOut, User } from "lucide-react"
import { USER_DATA_CHANGE_EVENT } from "../untils/events"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("User")
  const [userInitials, setUserInitials] = useState("US")
  const [userAvatar, setUserAvatar] = useState("")
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const getUserDataFromStorage = () => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("userEmail") || "User"
      setUserEmail(email)

      const initials = email.split("@")[0].substring(0, 2).toUpperCase()
      setUserInitials(initials)

      const avatar = localStorage.getItem("userAvatar") || ""
      setUserAvatar(avatar)

      if (!avatar) {
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          if (userData.avatar) {
            setUserAvatar(userData.avatar)
          } else if (userData.profilePicture) {
            setUserAvatar(userData.profilePicture)
          } else if (userData.image) {
            setUserAvatar(userData.image)
          }
        } catch (e) {
          console.error("Error parsing user data:", e)
        }
      }
    }
  }

  useEffect(() => {
    const handleUserDataChange = () => {
      getUserDataFromStorage()
      setUpdateTrigger((prev) => prev + 1)
    }

    window.addEventListener(USER_DATA_CHANGE_EVENT, handleUserDataChange)

    getUserDataFromStorage()

    return () => {
      window.removeEventListener(USER_DATA_CHANGE_EVENT, handleUserDataChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userData")
    localStorage.removeItem("userAvatar")
    router.push("/")
  }

  const navItems = [
    { name: "Home", icon: <Home className="h-5 w-5" />, href: "/quizzes" },
    { name: "History", icon: <History className="h-5 w-5" />, href: "/history" },
    { name: "Forum", icon: <MessageSquare className="h-5 w-5" />, href: "/forum" },
    { name: "Donate", icon: <Heart className="h-5 w-5" />, href: "/donate" },
  ]

  const isActive = (href: string) => {
    if (href === "/quizzes" && pathname === "/") {
      return true 
    }
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-950 dark:border-gray-800">
      <div className="flex h-14 items-center px-4">
        {/* Left section - Logo */}
        <div className="flex-none mr-4">
          <Link href="/quizzes" className="font-bold">
            Quiz App
          </Link>
        </div>

        {/* Mobile menu button - only visible on small screens */}
        <div className="md:hidden flex-none mr-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Quiz App</SheetTitle>
                <SheetDescription>Navigation Menu</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      router.push(item.href)
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </span>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center section - Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.href) ? "default" : "ghost"}
              size="sm"
              className="px-4"
              asChild
            >
              <Link href={item.href}>
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </span>
              </Link>
            </Button>
          ))}
        </div>

        {/* Right section - User info */}
        <div className="flex items-center ml-auto">
          <div className="font-bold mr-2"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {userAvatar ? (
                    <AvatarImage
                      src={userAvatar || "/placeholder.svg"}
                      alt="User avatar"
                      onError={(e) => {
                        console.error("Avatar image failed to load:", e)
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {userAvatar ? <AvatarImage src={userAvatar || "/placeholder.svg"} alt="User avatar" /> : null}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/quizzes" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
