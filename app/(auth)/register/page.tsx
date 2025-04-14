import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Tạo tài khoản mới</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Đăng ký để tham gia cộng đồng</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
