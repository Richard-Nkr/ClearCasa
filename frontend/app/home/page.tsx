import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import BackgroundMap from "@/components/BackgroundMap";

export default async function HomePage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/");
    }

    return (
        <AuthenticatedLayout>
            <div className="flex-1 h-full">
                <BackgroundMap />
            </div>
        </AuthenticatedLayout>
    );
}
