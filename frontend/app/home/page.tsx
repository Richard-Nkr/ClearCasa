import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

export default async function HomePage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
            <main className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                    Welcome to Your Home Page
                </h1>
                <p className="text-xl text-white mb-8">
                    You're now signed in!
                </p>
                <AuthButtons />
            </main>
        </div>
    );
}