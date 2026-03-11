// utils/api.js
// ✅ Drop this file in app/component/admin/utils/api.js
// Import it in every page: import { authFetch, getToken } from "../utils/api"

export const getToken = () => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("token") || ""
}

export const authFetch = (url, options = {}) => {
    const token = getToken()
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