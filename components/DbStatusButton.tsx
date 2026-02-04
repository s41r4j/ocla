"use client";

import { useEffect, useState } from "react";

type DbStatus = "checking" | "connected" | "disconnected" | "error";

export function DbStatusButton() {
    const [status, setStatus] = useState<DbStatus>("checking");
    const [message, setMessage] = useState("");

    const checkDb = async () => {
        setStatus("checking");
        setMessage("");
        try {
            const res = await fetch("/api/leaderboard", { cache: "no-store" });
            const json = await res.json();

            if (json.dbEnabled === true) {
                setStatus("connected");
                setMessage(`Connected (${json.rows?.length ?? 0} models)`);
            } else if (json.dbEnabled === false) {
                setStatus("disconnected");
                setMessage("DATABASE_URL not configured");
            } else {
                setStatus("error");
                setMessage("Unknown response");
            }
        } catch (e) {
            setStatus("error");
            setMessage(e instanceof Error ? e.message : "Connection failed");
        }
    };

    useEffect(() => {
        checkDb();
    }, []);

    const statusColors: Record<DbStatus, string> = {
        checking: "border-gray-600 bg-gray-800 text-gray-300",
        connected: "border-green-600 bg-green-950/50 text-green-400",
        disconnected: "border-yellow-600 bg-yellow-950/50 text-yellow-400",
        error: "border-red-600 bg-red-950/50 text-red-400"
    };

    const statusIcons: Record<DbStatus, string> = {
        checking: "⏳",
        connected: "✅",
        disconnected: "⚠️",
        error: "❌"
    };

    return (
        <button
            onClick={checkDb}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${statusColors[status]}`}
            title={message || "Click to check DB status"}
        >
            <span>{statusIcons[status]}</span>
            <span>
                {status === "checking" && "Checking DB..."}
                {status === "connected" && "DB Connected"}
                {status === "disconnected" && "DB Not Configured"}
                {status === "error" && "DB Error"}
            </span>
        </button>
    );
}
