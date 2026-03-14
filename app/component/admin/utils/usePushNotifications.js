// app/component/admin/utils/usePushNotifications.js
// Drop this hook in any page to subscribe to push notifications

import { useEffect, useState } from "react"
import { API_BASE, getUser } from "./api"

// Convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const raw     = atob(base64)
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export const usePushNotifications = () => {
    const [supported,   setSupported]   = useState(false)
    const [permission,  setPermission]  = useState("default")
    const [subscribed,  setSubscribed]  = useState(false)
    const [error,       setError]       = useState(null)

    useEffect(() => {
        setSupported("serviceWorker" in navigator && "PushManager" in window)
        setPermission(Notification.permission)
    }, [])

    const subscribe = async () => {
        try {
            setError(null)
            // Register service worker
            const reg = await navigator.serviceWorker.register("/sw.js")
            await navigator.serviceWorker.ready

            // Request notification permission
            const perm = await Notification.requestPermission()
            setPermission(perm)
            if (perm !== "granted") {
                setError("Notification permission denied")
                return false
            }

            // Get VAPID public key from server
            const keyRes  = await fetch(`${API_BASE}/push/vapid-public-key`)
            const keyData = await keyRes.json()

            // Subscribe to push
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
            })

            // Send subscription to backend
            const user = getUser()
            await fetch(`${API_BASE}/push/subscribe`, {
                method:  "POST",
                headers: {
                    "Content-Type":  "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
                },
                credentials: "include",
                body: JSON.stringify({
                    subscription,
                    role:       user.role       || "admin",
                    schoolCode: user.schoolCode || "",
                    userId:     user.id         || user._id || ""
                })
            })

            setSubscribed(true)
            return true
        } catch (err) {
            setError(err.message)
            return false
        }
    }

    const unsubscribe = async () => {
        try {
            const reg  = await navigator.serviceWorker.getRegistration("/sw.js")
            const sub  = await reg?.pushManager?.getSubscription()
            if (sub) {
                await sub.unsubscribe()
                await fetch(`${API_BASE}/push/unsubscribe`, {
                    method:  "POST",
                    headers: {
                        "Content-Type":  "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
                    },
                    credentials: "include",
                    body: JSON.stringify({ endpoint: sub.endpoint })
                })
            }
            setSubscribed(false)
        } catch (err) {
            setError(err.message)
        }
    }

    return { supported, permission, subscribed, error, subscribe, unsubscribe }
}