export default function DonatePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Donate</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          emcuoiroiakhongdoianhnua
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <img
          src="https://api.vietqr.io/image/970403-030073919874-Ba2sB0p.jpg?accountName=TA%20TRUONG%20GIANG&amount=13000&addInfo=emcuoiroiakhongdoianhnuaa"
          alt="QR Donate"
          className="w-[300px] h-auto rounded-lg shadow-md border"
        />
      </div>
    </div>
  )
}
