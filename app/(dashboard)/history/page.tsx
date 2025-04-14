"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isValid } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Calendar, Award, FileText, ChevronRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuizHistory, type QuizSession } from "@/hooks/use-quiz-history"

export default function HistoryPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "passed" | "failed">("all")

  // Lấy userId từ localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      if (userData._id) {
        setUserId(userData._id)
      } else if (userData.id) {
        setUserId(userData.id)
      } else if (userData.userId) {
        setUserId(userData.userId)
      }
    } catch (e) {
      console.error("Error getting user ID:", e)
    }
  }, [])

  const { data: quizSessions = [], isLoading, error } = useQuizHistory(userId)

  useEffect(() => {
    if (quizSessions.length > 0) {
      console.log("Quiz Sessions:", quizSessions)
    }
  }, [quizSessions])

  const filteredSessions = quizSessions.filter((session: QuizSession) => {
    const totalQuestions = session.correctAnswersCount + session.incorrectAnswersCount
    if (totalQuestions === 0) return true

    const passRate = (session.correctAnswersCount / totalQuestions) * 100
    if (filter === "passed") return passRate >= 60
    if (filter === "failed") return passRate < 60
    return true
  })

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Đang tải lịch sử làm quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/quizzes")}>Quay lại danh sách quiz</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lịch sử làm quiz</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Xem lại các bài quiz bạn đã làm</p>
      </div>

      <Tabs
        defaultValue="all"
        value={filter}
        onValueChange={(value) => setFilter(value as "all" | "passed" | "failed")}
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="passed">Đạt</TabsTrigger>
            <TabsTrigger value="failed">Chưa đạt</TabsTrigger>
          </TabsList>
          <p className="mt-2 text-sm text-gray-500 sm:mt-0">
            Hiển thị {sortedSessions.length} kết quả trong tổng số {quizSessions.length} bài làm
          </p>
        </div>

        <TabsContent value="all" className="mt-0">
          <QuizHistoryList sessions={sortedSessions} />
        </TabsContent>
        <TabsContent value="passed" className="mt-0">
          <QuizHistoryList sessions={sortedSessions} />
        </TabsContent>
        <TabsContent value="failed" className="mt-0">
          <QuizHistoryList sessions={sortedSessions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface QuizHistoryListProps {
  sessions: QuizSession[]
}

function QuizHistoryList({ sessions }: QuizHistoryListProps) {
  const router = useRouter()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="mb-2 h-12 w-12 text-gray-400" />
          <h3 className="mb-1 text-lg font-medium">Không có dữ liệu</h3>
          <p className="text-sm text-gray-500">Bạn chưa làm bài quiz nào trong danh mục này</p>
          <Button onClick={() => router.push("/quizzes")} className="mt-4">
            Làm quiz ngay
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <QuizHistoryItem key={session._id} session={session} />
      ))}
    </div>
  )
}

interface QuizHistoryItemProps {
  session: QuizSession
}

function QuizHistoryItem({ session }: QuizHistoryItemProps) {
  const router = useRouter()

  const quizInfo = typeof session.testId === "object" ? session.testId : null

  console.log("Session testId:", session.testId)

  const totalQuestions = session.correctAnswersCount + session.incorrectAnswersCount
  const score = totalQuestions > 0 ? (session.correctAnswersCount / totalQuestions) * 100 : 0
  const isPassed = score >= 60

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Không có dữ liệu"

    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return "Ngày không hợp lệ"
      return format(date, "HH:mm - dd/MM/yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Ngày không hợp lệ"
    }
  }

  const getQuizName = () => {
    if (quizInfo && typeof quizInfo === "object") {
      return (
        quizInfo.name ||
        quizInfo.title ||
        `Quiz ID: ${typeof session.testId === "string" ? session.testId : quizInfo._id}`
      )
    }
    return `Quiz ID: ${session.testId}`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-medium">{getQuizName()}</h3>
              <Badge variant={isPassed ? "default" : "destructive"}>{isPassed ? "Đạt" : "Chưa đạt"}</Badge>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Hoàn thành vào {formatDate(session.createdAt)}</span>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="font-medium">
                  Số câu hoàn thành: {score.toFixed(0)}% ({session.correctAnswersCount}/{totalQuestions})
                </span>
              </div>
            </div>

            <Progress value={score} className="h-2" />
          </div>

          {/* <div className="flex items-center justify-center border-t bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900 md:border-l md:border-t-0">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/quiz/${typeof session.testId === "object" ? session.testId._id : session.testId}`)
              }
              className="w-full md:w-auto"
            >
              Làm lại <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}
