"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, FileQuestion, ImageOff } from "lucide-react"
import { API_QUIZZES, API_SEARCH_QUIZZES } from "@/configs/api-config"
import SearchBar from "@/components/search-bar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Quiz {
  id: string
  _id?: string
  title?: string
  name?: string
  description?: string
  image?: string
  totalQuestions?: number
  timeLimit?: number
  questions?: string[]
}

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem("authToken")

      if (!token) {
        router.push("/")
        return
      }

      try {
        const response = await fetch(API_QUIZZES, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken")
            router.push("/")
            return
          }
          throw new Error("Failed to fetch quizzes")
        }

        const data = await response.json()
        // console.log("Quizzes data:", data) 

        const processedQuizzes = Array.isArray(data)
          ? data.map((quiz) => ({
              ...quiz,
              totalQuestions: quiz.questions ? quiz.questions.length : undefined,
            }))
          : []

        setQuizzes(processedQuizzes)
        setAllQuizzes(processedQuizzes) 
      } catch (err) {
        console.error("Error fetching quizzes:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [router])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setSearchError(null)
    setSearching(true)

    if (!query.trim()) {
      setQuizzes(allQuizzes)
      setSearching(false)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        router.push("/")
        return
      }

      console.log(`Searching for: "${query}" using endpoint: ${API_SEARCH_QUIZZES}?name=${encodeURIComponent(query)}`)

      try {
        const response = await fetch(`${API_SEARCH_QUIZZES}?name=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Search response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Server search results:", data)

          if (Array.isArray(data)) {
            const processedQuizzes = data.map((quiz) => ({
              ...quiz,
              totalQuestions: quiz.questions ? quiz.questions.length : undefined,
            }))
            setQuizzes(processedQuizzes)
            setSearching(false)
            return
          }
        } else {
          console.log("Server search failed, falling back to client-side search")
        }
      } catch (serverSearchError) {
        console.error("Error with server search:", serverSearchError)
      }

      console.log("Performing client-side search")
      const lowercaseQuery = query.toLowerCase()
      const normalizedQuery = query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

      const filteredQuizzes = allQuizzes.filter((quiz) => {
        const name = (quiz.name || quiz.title || "").toLowerCase()
        const normalizedName = name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()

        return name.includes(lowercaseQuery) || normalizedName.includes(normalizedQuery)
      })

      console.log(`Found ${filteredQuizzes.length} matches client-side`)
      setQuizzes(filteredQuizzes)
    } catch (err) {
      console.error("Error during search:", err)
      setSearchError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setSearching(false)
    }
  }

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`)
  }

  const handleImageError = (quizId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [quizId]: true,
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading quizzes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Error</h2>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {/* <h1 className="text-3xl font-bold">Danh sách quiz</h1> */}
          {/* <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("authToken")
              router.push("/")
            }}
          >
            Logout
          </Button> */}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full max-w-md">
            <SearchBar onSearch={handleSearch} placeholder="Search quizzes by name..." />
          </div>
          {searching && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
        </div>
        {searchError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}
        {searchQuery && !searching && (
          <p className="mt-2 text-sm text-gray-500">
            {quizzes.length === 0
              ? ""
              : `Tìm thấy ${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"} phù hợp với kết quả "${searchQuery}"`}
          </p>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">Không tìm thấy kết quả</p>
          {searchQuery && (
            <div className="mt-4">
              <Button variant="outline" className="mt-2" onClick={() => handleSearch("")}>
                Danh sách quiz
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const quizId = quiz.id || quiz._id || ""
            const hasImageError = imageErrors[quizId]
            const questionCount = quiz.totalQuestions || (quiz.questions ? quiz.questions.length : undefined)

            return (
              <Card key={quizId} className="overflow-hidden">
                {quiz.image && !hasImageError ? (
                  <div className="relative h-48 w-full">
                    <img
                      src={quiz.image || "/placeholder.svg"}
                      alt={`Image for ${quiz.title || quiz.name}`}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError(quizId)}
                    />
                  </div>
                ) : quiz.image ? (
                  <div className="flex h-48 w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ImageOff className="mb-2 h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">Image not available</p>
                  </div>
                ) : null}

                <CardHeader>
                  <CardTitle>{quiz.title || quiz.name}</CardTitle>
                  {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    {questionCount && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FileQuestion className="mr-2 h-4 w-4" />
                        <span>{questionCount} questions</span>
                      </div>
                    )}
                    {quiz.timeLimit && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{quiz.timeLimit} minutes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleStartQuiz(quizId)}>
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
