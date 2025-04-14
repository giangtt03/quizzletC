"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, Tag } from "lucide-react"
import TopicList from "@/components/forum/topic-list"
import TopicListSkeleton from "@/components/forum/topic-list-skeleton"
import { useTopics, useTopicsByTag, useSearchTopics } from "@/hooks/use-forum-data"

export default function ForumPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Queries
  const { data: allTopics = [], isLoading: isLoadingAllTopics, error: allTopicsError } = useTopics()

  const { data: tagTopics = [], isLoading: isLoadingTagTopics, error: tagTopicsError } = useTopicsByTag(selectedTag)

  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchTopics(isSearching ? searchQuery : "")

  // Xác định dữ liệu và trạng thái hiện tại dựa trên tab đang active
  const currentTopics = activeTab === "all" ? allTopics : activeTab === "tag" ? tagTopics : searchResults
  const isLoading =
    activeTab === "all" ? isLoadingAllTopics : activeTab === "tag" ? isLoadingTagTopics : isLoadingSearch
  const error = activeTab === "all" ? allTopicsError : activeTab === "tag" ? tagTopicsError : searchError

  useEffect(() => {
    if (allTopics.length > 0) {
      const allTags: string[] = []
      allTopics.forEach((topic: any) => {
        if (topic.tags && Array.isArray(topic.tags)) {
          allTags.push(...topic.tags)
        }
      })

      const tagCounts: Record<string, number> = {}
      allTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })

      const sortedTags = Object.keys(tagCounts)
        .sort((a, b) => tagCounts[b] - tagCounts[a])
        .slice(0, 5)
      setPopularTags(sortedTags)
    }
  }, [allTopics])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setActiveTab("all")
      setIsSearching(false)
      return
    }

    setActiveTab("search")
    setIsSearching(true)
    await refetchSearch()
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    setActiveTab("tag")
  }

  const handleCreateTopic = () => {
    router.push("/forum/create")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Thảo luận và chia sẻ kiến thức</p>
        </div>
        <Button onClick={handleCreateTopic} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Tạo chủ đề mới
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Chủ đề thảo luận</CardTitle>
                <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Tìm kiếm chủ đề..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger
                    value="all"
                    onClick={() => {
                      setIsSearching(false)
                      setSelectedTag(null)
                    }}
                  >
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger
                    value="tag"
                    onClick={() => {
                      if (popularTags.length > 0 && !selectedTag) {
                        setSelectedTag(popularTags[0])
                      }
                    }}
                  >
                    Theo thẻ {selectedTag ? `(${selectedTag})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="search" disabled={!isSearching}>
                    Kết quả tìm kiếm
                  </TabsTrigger>
                </TabsList>

                {/* Nội dung tab */}
                <div>
                  {isLoading ? (
                    <TopicListSkeleton />
                  ) : error ? (
                    <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                      <p>{(error as Error).message || "Đã xảy ra lỗi khi tải dữ liệu"}</p>
                    </div>
                  ) : currentTopics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      {activeTab === "all" ? (
                        <>
                          <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
                          <h3 className="mb-1 text-lg font-medium">Chưa có chủ đề nào</h3>
                          <p className="text-sm text-gray-500">Hãy tạo chủ đề đầu tiên để bắt đầu thảo luận</p>
                        </>
                      ) : activeTab === "tag" ? (
                        <>
                          <Tag className="mb-2 h-12 w-12 text-gray-400" />
                          <h3 className="mb-1 text-lg font-medium">Không có chủ đề nào cho thẻ này</h3>
                          <p className="text-sm text-gray-500 mb-4">Chọn một thẻ khác hoặc tạo chủ đề mới</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {popularTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`cursor-pointer px-3 py-1 text-sm ${selectedTag === tag ? "bg-primary text-primary-foreground" : ""}`}
                                onClick={() => handleTagClick(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Search className="mb-2 h-12 w-12 text-gray-400" />
                          <h3 className="mb-1 text-lg font-medium">Không tìm thấy kết quả</h3>
                          <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <TopicList topics={currentTopics} />
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thẻ phổ biến</CardTitle>
              <CardDescription>Các chủ đề được thảo luận nhiều</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.length > 0 ? (
                  popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`cursor-pointer ${selectedTag === tag ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Chưa có thẻ nào</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setActiveTab("all")
                  setSelectedTag(null)
                  setIsSearching(false)
                }}
              >
                Xem tất cả chủ đề
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
