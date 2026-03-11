// app/component/teacher/utils/api.js
// ✅ Import this in every teacher page instead of reading localStorage directly
// Usage:  const { user, classes, token } = useTeacher()

import { useState, useEffect } from "react"

export const useTeacher = () => {
    const [user,    setUser]    = useState(null)
    const [classes, setClasses] = useState([])
    const [token,   setToken]   = useState("")

    useEffect(() => {
        if (typeof window === "undefined") return
        const raw = localStorage.getItem("user")
        const tok = localStorage.getItem("token") || ""
        setToken(tok)
        if (!raw) return
        try {
            const parsed = JSON.parse(raw)
            setUser(parsed)

            // ✅ login saves assignedClasses — not classes
            // fallback-check both keys just in case
            const saved =
                Array.isArray(parsed.assignedClasses) ? parsed.assignedClasses :
                Array.isArray(parsed.classes)         ? parsed.classes         : []

            if (saved.length > 0) {
                setClasses(saved)
            } else if (parsed.id && tok) {
                // assignedClasses not in localStorage — fetch from backend
                fetch(`http://localhost:5000/teacher/${parsed.id}`, {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tok}`
                    }
                })
                    .then(r => r.json())
                    .then(data => {
                        const fetched = data.assignedClasses || data.teacher?.assignedClasses || []
                        setClasses(Array.isArray(fetched) ? fetched : [])
                    })
                    .catch(() => {})
            }
        } catch { /* ignore bad JSON */ }
    }, [])

    return { user, classes, token }
}

// ✅ Helper — sends token on every request automatically
export const teacherFetch = (url, options = {}) => {
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