import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    return (
        <AuthenticatedLayout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                {/* Add your settings content here */}
            </div>
        </AuthenticatedLayout>
    );
}
