import type React from "react"
import Navbar from "../../components/narbar"
import Footer from "../../components/footer"
import QueryProvider from "../../providers/query-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </QueryProvider>
  )
}
