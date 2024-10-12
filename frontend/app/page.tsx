import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to ClearCasa
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Simplify your home management
        </p>
        <GoogleAuthButton />
      </main>
    </div>
  );
}
