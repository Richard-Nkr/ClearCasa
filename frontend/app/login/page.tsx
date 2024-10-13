import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authOptions } from "../api/auth/[...nextauth]/route";

// Dynamically import GoogleAuthButton with no SSR
const GoogleAuthButton = dynamic(() => import("@/components/GoogleAuthButton"), {
    ssr: false
});

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/home');
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="text-center p-8 rounded-lg bg-white shadow-lg max-w-md w-full">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Welcome to ClearCasa
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Simplify your home management
                </p>
                <GoogleAuthButton />
            </div>
        </div>
    );
}
