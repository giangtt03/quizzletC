"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, ImageOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_QUIZ_DETAILS, API_TAKE_TEST } from "@/configs/api-config"


interface Answer {
  _id?: string
  answer: string
  correct: string 
}

interface Question {
  _id: string
  content: string
  answers: Answer[]
  category?: string
}

interface QuizDetails {
  _id: string
  title: string
  name?: string
  description: string
  image?: string
  timeLimit?: number
  questions?: Question[]
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<{
    totalQuestions: number
    correctAnswers: Record<string, string>
  } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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


  useEffect(() => {
    const fetchQuizDetails = async () => {
      const token = localStorage.getItem("authToken")

      if (!token) {
        router.push("/")
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching quiz details for ID: ${quizId}`)
        const response = await fetch(`${API_QUIZ_DETAILS}/${quizId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Quiz details fetch failed with status ${response.status}: ${errorText}`)

          if (response.status === 401) {
            localStorage.removeItem("authToken")
            router.push("/")
            return
          }
          throw new Error(`Failed to fetch quiz details: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Quiz details response:", data)

        const extractedQuizDetails: QuizDetails = {
          _id: data._id || data.id || quizId,
          title: data.title || data.name || "Quiz",
          name: data.name,
          description: data.description || "Hoàn thành thất cả câu hỏi & submit",
          image: data.image,
          timeLimit: data.timeLimit,
          questions: data.questions || [],
        }

        setQuizDetails(extractedQuizDetails)

        if (
          extractedQuizDetails.questions &&
          Array.isArray(extractedQuizDetails.questions) &&
          extractedQuizDetails.questions.length > 0
        ) {
          console.log("Using questions from quiz details response")
          setQuestions(extractedQuizDetails.questions)
          setLoading(false)
          return 
        }

        console.log("Trying direct approach to get test questions")
        try {
          const directResponse = await fetch(`${API_QUIZ_DETAILS}/${quizId}?includeQuestions=true`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (directResponse.ok) {
            const directData = await directResponse.json()
            console.log("Direct response:", directData)

            if (directData.questions && Array.isArray(directData.questions) && directData.questions.length > 0) {
              setQuestions(directData.questions)
              setLoading(false)
              return
            }
          }
        } catch (directError) {
          console.error("Error with direct approach:", directError)
        }

        console.log("Trying takeTest endpoint")
        try {
          const takeTestResponse = await fetch(API_TAKE_TEST, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              testId: quizId,
            }),
          })

          if (takeTestResponse.ok) {
            const takeTestData = await takeTestResponse.json()
            console.log("TakeTest response:", takeTestData)

            let extractedQuestions: Question[] = []

            if (takeTestData.questions && Array.isArray(takeTestData.questions)) {
              extractedQuestions = takeTestData.questions
            } else if (Array.isArray(takeTestData)) {
              extractedQuestions = takeTestData
            } else if (takeTestData.data && Array.isArray(takeTestData.data)) {
              extractedQuestions = takeTestData.data
            }

            if (extractedQuestions.length > 0) {
              setQuestions(extractedQuestions)
              setLoading(false)
              return
            }
          } else {
            const errorText = await takeTestResponse.text()
            console.error(`TakeTest failed with status ${takeTestResponse.status}: ${errorText}`)
          }
        } catch (takeTestError) {
          console.error("Error with takeTest:", takeTestError)
        }

        console.log("All attempts failed. Creating mock questions for testing.")
        const mockQuestions: Question[] = [
          {
            _id: "q1",
            content: "This is a mock question 1. The actual API call failed.",
            answers: [
              { answer: "Option A", correct: "true" },
              { answer: "Option B", correct: "false" },
              { answer: "Option C", correct: "false" },
              { answer: "Option D", correct: "false" },
            ],
          },
          {
            _id: "q2",
            content: "This is a mock question 2. Please check the API endpoint.",
            answers: [
              { answer: "Option 1", correct: "false" },
              { answer: "Option 2", correct: "true" },
              { answer: "Option 3", correct: "false" },
              { answer: "Option 4", correct: "false" },
            ],
          },
        ]

        setQuestions(mockQuestions)
        setError("Could not load actual questions. Using mock questions for testing.")
      } catch (err) {
        console.error("Error in quiz fetch process:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchQuizDetails()
  }, [quizId, router])

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const getCorrectAnswer = (question: Question): string => {
    const correctAnswerObj = question.answers.find((a) => a.correct === "true")
    return correctAnswerObj ? correctAnswerObj.answer : ""
  }

  const getAnswerIndex = (question: Question, answerText: string): number => {
    return question.answers.findIndex((a) => a.answer === answerText)
  }

  const handleSubmitQuiz = async () => {
    const token = localStorage.getItem("authToken")

    if (!token) {
      router.push("/")
      return
    }

    if (!userId) {
      setSubmitError("User ID not found. Please log in again.")
      return
    }

    setSubmitting(true)
    setError(null)
    setSubmitError(null)

    try {
      const correctAnswers: Record<string, string> = {}
      questions.forEach((question) => {
        const correctAnswer = getCorrectAnswer(question)
        correctAnswers[question._id] = correctAnswer
      })

      const formattedAnswers = Object.entries(answers).map(([questionId, answerText]) => {
        const question = questions.find((q) => q._id === questionId)

        const selectedAnswerIndex = question ? getAnswerIndex(question, answerText) : -1

        return {
          questionId,
          selectedAnswerIndex: selectedAnswerIndex >= 0 ? selectedAnswerIndex : 0,
        }
      })

      console.log("Submitting quiz results to server...")
      console.log("Request payload:", {
        testId: quizId,
        userId: userId,
        answers: formattedAnswers,
      })
      console.log("Questions length:", questions.length)
      console.log("Answers length:", formattedAnswers.length)
      console.log("Detailed questions:", questions)
      console.log("Detailed answers:", answers)

      const response = await fetch(API_TAKE_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: quizId,
          userId: userId,
          answers: formattedAnswers,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Quiz submission failed with status ${response.status}: ${errorText}`)

        if (response.status === 401) {
          localStorage.removeItem("authToken")
          router.push("/")
          return
        }

        throw new Error(`Failed to submit quiz: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Quiz submission response:", data)

      setResults({
        totalQuestions: questions.length,
        correctAnswers: correctAnswers,
      })

      setQuizSubmitted(true)
    } catch (err) {
      console.error("Error in quiz submission:", err)
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred while submitting the quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading quiz...</p>
      </div>
    )
  }

  if (quizDetails && questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>{quizDetails.title || quizDetails.name}</CardTitle>
            <CardDescription>{quizDetails.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>No Questions Available</AlertTitle>
              <AlertDescription>
                This quiz doesn't have any questions yet. Please try another quiz or check back later.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/quizzes")} className="w-full">
              Back to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizSubmitted && results) {
    let correctCount = 0
    questions.forEach((question) => {
      const userAnswer = answers[question._id]
      const correctAnswer = results.correctAnswers[question._id]
      if (userAnswer === correctAnswer) {
        correctCount++
      }
    })

    return (
      <div className="container mx-auto py-8">
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>
              You answered {correctCount} out of {results.totalQuestions} correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={(correctCount / results.totalQuestions) * 100} className="h-3" />
              <p className="mt-2 text-right text-sm text-gray-500">
                {Math.round((correctCount / results.totalQuestions) * 100)}%
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = answers[question._id]
                const correctAnswer = results.correctAnswers[question._id]
                const isCorrect = userAnswer === correctAnswer

                return (
                  <div key={question._id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-medium">
                        {index + 1}. {question.content}
                      </h3>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-6 mt-2 space-y-2">
                      {question.answers.map((answerObj) => {
                        const option = answerObj.answer
                        const isUserAnswer = option === userAnswer
                        const isCorrectAnswer = option === correctAnswer

                        let className = "text-gray-700 dark:text-gray-300"
                        if (isUserAnswer && !isCorrect) {
                          className = "text-red-500 font-medium"
                        } else if (isCorrectAnswer) {
                          className = "text-green-500 font-medium"
                        }

                        return (
                          <p key={option} className={className}>
                            {option}
                            {isUserAnswer && " (Your answer)"}
                            {isCorrectAnswer && !isUserAnswer && " (Correct answer)"}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/quizzes")} className="w-full">
              Back to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="container mx-auto py-8">
      {error && (
        <Alert className="mb-4">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quizDetails?.title || quizDetails?.name || "Quiz"}</CardTitle>
              <CardDescription>{quizDetails?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Quiz Image */}
        {quizDetails?.image && (
          <div className="px-6">
            <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg sm:h-64 md:h-80">
              {!imageError ? (
                <img
                  src={quizDetails.image || "/placeholder.svg"}
                  alt={`Image for ${quizDetails.title || quizDetails.name}`}
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <ImageOff className="mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500">Image not available</p>
                </div>
              )}
            </div>
          </div>
        )}

        <CardContent>
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentQuestion && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">{currentQuestion.content}</h3>

              <RadioGroup
                value={answers[currentQuestion._id] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestion._id, value)}
                className="space-y-3"
              >
                {currentQuestion.answers.map((answerObj) => (
                  <div
                    key={answerObj.answer}
                    className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <RadioGroupItem value={answerObj.answer} id={answerObj.answer} />
                    <Label htmlFor={answerObj.answer} className="w-full cursor-pointer">
                      {answerObj.answer}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length !== questions.length}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} disabled={!answers[currentQuestion._id]}>
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
