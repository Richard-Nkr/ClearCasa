import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    debug: process.env.NODE_ENV === 'development',
    callbacks: {
        async signIn({ user, account }) {
            console.log("Sign in callback triggered", { user, account });
            if (account?.provider === "google") {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                    console.log(`Attempting to create/update user in backend: ${apiUrl}/api/user`);
                    const response = await fetch(`${apiUrl}/api/user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            googleId: user.id, // Changed from sub to googleId
                        }),
                    });

                    if (response.ok) {
                        console.log("User successfully created/updated in backend");
                        return true;
                    } else {
                        const errorText = await response.text();
                        console.error("Error response from API:", response.status, errorText);
                        return false;
                    }
                } catch (error) {
                    console.error("Error during sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            session.accessToken = token.accessToken
            return session
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
