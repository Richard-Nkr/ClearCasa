import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

export default async function LandingPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/home");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Our Application
        </h1>
        <p className="text-xl text-white mb-8">
          We're excited to have you here!
        </p>
        <AuthButtons />
      </main>
    </div>
  );
}
