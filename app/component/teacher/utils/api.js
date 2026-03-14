// // app/component/teacher/utils/api.js
// // ✅ Import this in every teacher page instead of reading localStorage directly
// // Usage:  const { user, classes, token } = useTeacher()

// import { useState, useEffect } from "react"

// export const useTeacher = () => {
//     const [user,    setUser]    = useState(null)
//     const [classes, setClasses] = useState([])
//     const [token,   setToken]   = useState("")

//     useEffect(() => {
//         if (typeof window === "undefined") return
//         const raw = localStorage.getItem("user")
//         const tok = localStorage.getItem("token") || ""
//         setToken(tok)
//         if (!raw) return
//         try {
//             const parsed = JSON.parse(raw)
//             setUser(parsed)

//             // ✅ login saves assignedClasses — not classes
//             // fallback-check both keys just in case
//             const saved =
//                 Array.isArray(parsed.assignedClasses) ? parsed.assignedClasses :
//                 Array.isArray(parsed.classes)         ? parsed.classes         : []

//             if (saved.length > 0) {
//                 setClasses(saved)
//             } else if (parsed.id && tok) {
//                 // assignedClasses not in localStorage — fetch from backend
//                 fetch(`http://localhost:5000/teacher/${parsed.id}`, {
//                     credentials: "include",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${tok}`
//                     }
//                 })
//                     .then(r => r.json())
//                     .then(data => {
//                         const fetched = data.assignedClasses || data.teacher?.assignedClasses || []
//                         setClasses(Array.isArray(fetched) ? fetched : [])
//                     })
//                     .catch(() => {})
//             }
//         } catch { /* ignore bad JSON */ }
//     }, [])

//     return { user, classes, token }
// }

// // ✅ Helper — sends token on every request automatically
// export const teacherFetch = (url, options = {}) => {
//     const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
//     return fetch(url, {
//         ...options,
//         credentials: "include",
//         headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//             ...(options.headers || {}),
//         },
//     })
// }

// app/component/admin/utils/api.js  (shared by admin, teacher, parent)
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all API calls across the app.
// Change NEXT_PUBLIC_API_URL in .env → applies everywhere incl. mobile build.
// ─────────────────────────────────────────────────────────────────────────────
"use client"
import { useState, useEffect } from "react"

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
    window.dispatchEvent(new CustomEvent("userUpdated", { detail: updates }))
}

// ── Core fetch wrapper (works for all roles) ─────────────────────────────────
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
    if (res.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        const path = window.location.pathname
        if      (path.includes("/teacher")) window.location.href = "/component/auth/teacherLogin"
        else if (path.includes("/parent"))  window.location.href = "/component/auth/parentLogin"
        else                                window.location.href = "/component/auth/admin"
    }
    return res
}

// ── Role aliases (same function — avoids import errors in teacher/parent pages)
export const teacherFetch = authFetch
export const parentFetch  = authFetch

// ── React hook: get live user from localStorage + listen for updates ─────────
const makeUseRole = (roleCheck) => () => {
    const [user, setUser_] = useState(() => {
        if (typeof window === "undefined") return null
        const u = getUser()
        return u?.role === roleCheck || !roleCheck ? u : null
    })

    useEffect(() => {
        const sync = () => {
            const u = getUser()
            setUser_(u?.role === roleCheck || !roleCheck ? u : null)
        }
        window.addEventListener("userUpdated", sync)
        window.addEventListener("storage",     sync)
        return () => {
            window.removeEventListener("userUpdated", sync)
            window.removeEventListener("storage",     sync)
        }
    }, [])

    return { user }
}

export const useAdmin   = makeUseRole("admin")
export const useTeacher = makeUseRole("teacher")
export const useParent  = makeUseRole("parent")
export const useAuthUser = makeUseRole(null)   // any role