'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function GoogleAuthButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            console.log("Initiating Google sign-in")
            const result = await signIn('google', { callbackUrl: '/home', redirect: false })
            console.log("Sign-in result:", result)
            if (result?.error) {
                console.error("Sign-in error:", result.error)
            } else if (result?.url) {
                window.location.href = result.url
            }
        } catch (error) {
            console.error("Unexpected error during sign-in:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center">
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="bg-white text-gray-800 font-bold py-2 px-6 rounded-full border-2 border-black inline-flex items-center transition-all hover:bg-gray-100 disabled:opacity-50"
            >
                {isLoading ? (
                    <span>Loading...</span>
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            {/* SVG path data */}
                        </svg>
                        Continue with Google
                    </>
                )}
            </button>
        </div>
    )
}
