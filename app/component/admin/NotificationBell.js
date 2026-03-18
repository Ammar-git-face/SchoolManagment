// app/component/admin/NotificationBell.js
// Drop this in any dashboard header
"use client"
import { useState, useEffect } from "react"
import { Bell, BellOff, CheckCircle } from "lucide-react"
import { usePushNotifications } from "./utils/usePushNotifications"

export default function NotificationBell() {
    const { supported, permission, subscribed, error, subscribe, unsubscribe } = usePushNotifications()
    const [loading, setLoading] = useState(false)
    const [tooltip, setTooltip] = useState("")

    const handleToggle = async () => {
        setLoading(true)
        if (subscribed) {
            await unsubscribe()
            setTooltip("Push notifications off")
        } else {
            const ok = await subscribe()
            setTooltip(ok ? "Push notifications enabled!" : "Could not enable notifications")
        }
        setLoading(false)
        setTimeout(() => setTooltip(""), 3000)
    }

    if (!supported) return null

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                disabled={loading}
                title={subscribed ? "Disable push notifications" : "Enable push notifications"}
                className={`p-2 rounded-xl transition-all ${
                    subscribed
                        ? "bg-blue-100 text-blue-200 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                } ${loading ? "opacity-50 cursor-wait" : ""}`}>
                {subscribed ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
            {tooltip && (
                <div className="absolute top-11 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
                    {tooltip}
                </div>
            )}
            {error && (
                <div className="absolute top-11 right-0 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
                    {error}
                </div>
            )}
        </div>
    )
}