// app/component/admin/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all API calls across the app.
// Change API_BASE here → applies everywhere.
// For mobile (Capacitor/React Native): change to your deployed backend URL.
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const getToken = () => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("token") || ""
}

export const getUser = () => {
    if (typeof window === "undefined") return {}
    try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} }
}

export const setUser = (updates) => {
    if (typeof window === "undefined") return
    const current = getUser()
    localStorage.setItem("user", JSON.stringify({ ...current, ...updates }))
    // Notify all components listening (sidebar, header, etc.)
    window.dispatchEvent(new CustomEvent("userUpdated", { detail: updates }))
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────
export const authFetch = async (url, options = {}) => {
    const token = getToken()
    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    })

    // Auto-redirect on expired/invalid token
    if (res.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        const path = window.location.pathname
        if (path.includes("/teacher"))  window.location.href = "/component/auth/teacherLogin"
        else if (path.includes("/parent")) window.location.href = "/component/auth/parentLogin"
        else window.location.href = "/component/auth/admin"
    }

    return res
}