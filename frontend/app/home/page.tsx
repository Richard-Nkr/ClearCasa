import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default async function HomePage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/");
    }

    return (
        <AuthenticatedLayout>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Here's an overview of your tasks and upcoming events.
            </p>
            {/* Add dashboard content here */}
        </AuthenticatedLayout>
    );
}
