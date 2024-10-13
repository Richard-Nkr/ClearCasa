import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Providers from "@/components/Providers";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: "ClearCasa",
  description: "Simplify your home management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientSessionProvider>
            {children}
          </ClientSessionProvider>
        </Providers>
      </body>
    </html>
  );
}
