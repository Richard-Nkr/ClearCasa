'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // First, try to create the user
            const createUserResponse = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!createUserResponse.ok) {
                console.error('Failed to create user:', await createUserResponse.text());
            }

            // Regardless of whether the user was created or already existed, proceed with sign in
            const result = await signIn('email', { 
                email, 
                callbackUrl: '/home',
                redirect: false,
            });

            if (result?.error) {
                console.error('Error signing in:', result.error);
                // Handle error (e.g., show error message to user)
            } else {
                console.log('Check your email for the login link');
                // You might want to show a message to the user here
                router.push('/check-email');  // Redirect to a page telling the user to check their email
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/home' });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center">Create an account</h2>
                <p className="text-center text-gray-600">
                    Enter your email below to create your account
                </p>
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Sending login link...' : 'Sign In with Email'}
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                >
                    <FaGoogle className="mr-2 h-4 w-4" />
                    Google
                </Button>
                <p className="text-center text-sm text-gray-600">
                    By clicking continue, you agree to our{' '}
                    <a href="#" className="underline hover:text-gray-900">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="underline hover:text-gray-900">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
