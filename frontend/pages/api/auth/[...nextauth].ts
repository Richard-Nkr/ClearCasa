import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log('Sign in callback triggered');
            try {
                const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        name: user.name,
                        profilePicture: user.image,
                        googleId: account?.providerAccountId,
                    }),
                });

                if (apiRes.ok) {
                    console.log('User created/updated successfully');
                    return true;
                } else {
                    console.error('Failed to create/update user:', await apiRes.text());
                    return false;
                }
            } catch (error) {
                console.error('Error in signIn callback:', error);
                return false;
            }
        },
    },
    debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
