// app/component/parent/utils/useParent.js
// ✅ Import this in every parent page instead of reading localStorage directly
// Usage:  const { user, children, token } = useParent()

import { useState, useEffect } from "react"

export const useParent = () => {
    const [user,     setUser]     = useState(null)
    const [children, setChildren] = useState([])
    const [token,    setToken]    = useState("")

    useEffect(() => {
        if (typeof window === "undefined") return
        const raw = localStorage.getItem("user")
        const tok = localStorage.getItem("token") || ""
        setToken(tok)
        if (!raw) return
        try {
            const parsed = JSON.parse(raw)
            setUser(parsed)
            // ✅ Always an array — never crashes .map() or .reduce()
            setChildren(Array.isArray(parsed.children) ? parsed.children : [])
        } catch { /* ignore bad JSON */ }
    }, [])

    return { user, children, token }
}

// Helper — sends token on every request
export const parentFetch = (url, options = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
    return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    })
}