"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSignIn = async () => {
        await signIn("google");
        router.push("/home");
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div>
            {!session?.user ? (
                <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Sign in with Google
                </button>
            ) : (
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Sign out
                </button>
            )}
        </div>
    );
}