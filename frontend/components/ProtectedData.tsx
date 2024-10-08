"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ExtendedSession {
    accessToken?: string;
}

export default function ProtectedData() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (session?.accessToken) {
            fetch("http://localhost:3001/api/protected", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })
                .then((res) => res.json())
                .then((data) => setData(data))
                .catch((err) => console.error(err));
        }
    }, [session]);

    if (!session) {
        return <p>Please sign in to view protected data.</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold">Protected Data (Users in Database):</h2>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}