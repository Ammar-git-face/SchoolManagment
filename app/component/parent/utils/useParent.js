// app/component/parent/utils/useParent.js
import { useState, useEffect } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${API}"

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

export const useParent = () => {
    const [user,     setUser]     = useState(null)
    const [children, setChildren] = useState([])
    const [token,    setToken]    = useState("")
    const [loading,  setLoading]  = useState(true)

    useEffect(() => {
        if (typeof window === "undefined") return

        const tok = localStorage.getItem("token") || ""
        setToken(tok)

        // Load from localStorage immediately (no flicker)
        const raw = localStorage.getItem("user")
        if (!raw) { setLoading(false); return }

        let parsed = {}
        try { parsed = JSON.parse(raw) } catch { setLoading(false); return }

        setUser(parsed)
        // Set cached children first so pages aren't blank
        setChildren(Array.isArray(parsed.children) ? parsed.children : [])

        // ✅ Then fetch FRESH children from server — catches newly added students
        const parentId = parsed.id || parsed._id
        if (!parentId || !tok) { setLoading(false); return }

        fetch(`${API_BASE}/student/parent/${parentId}`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${tok}` }
        })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data) return
            const fresh = Array.isArray(data) ? data : (data.students || [])
            setChildren(fresh)
            // Update localStorage so next page load is also fresh
            localStorage.setItem("user", JSON.stringify({ ...parsed, children: fresh }))
        })
        .catch(() => { /* keep cached children on network error */ })
        .finally(() => setLoading(false))

    }, [])

    return { user, children, token, loading }
}

