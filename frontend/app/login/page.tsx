import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import GoogleAuthButton from "@/components/GoogleAuthButton";
import dynamic from 'next/dynamic';
import { authOptions } from "../api/auth/[...nextauth]/route";

// Dynamically import BackgroundMap with no SSR
const BackgroundMap = dynamic(() => import("@/components/BackgroundMap"), {
    ssr: false
});

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/home');
    }

    return (
        <div className="flex h-screen">
            {/* Left side content */}
            <div className="w-1/2 flex flex-col items-center justify-center bg-white z-10">
                <div className="text-center p-8 rounded-lg bg-white shadow-lg">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Welcome to ClearCasa
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Simplify your home management
                    </p>
                    <GoogleAuthButton />
                </div>
            </div>

            {/* Right side map */}
            <div className="w-1/2 relative">
                <BackgroundMap isLandingPage={true} />
            </div>
        </div>
    );
}
