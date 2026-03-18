"use client"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { API } from "../../../config/api"

const AdminLogin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`${API}/auth/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Login failed")

            // ✅ Backend returns { token, user: { id, name, email, role, schoolCode... } }
            const token = data.token
            const user  = data.user || {}

            if (token) localStorage.setItem("token", token)

            // ✅ Save full user so settings page can read schoolName, schoolCode etc.
            localStorage.setItem("user", JSON.stringify({
                id:            user.id            || user._id        || "",
                name:          user.name          || user.fullname   || "",
                email:         user.email         || email,
                role:          user.role          || "admin",
                schoolCode:    user.schoolCode    || "",
                schoolName:    user.schoolName    || "",
                schoolPhone:   user.schoolPhone   || "",
                schoolAddress: user.schoolAddress || "",
                schoolLogo:    user.schoolLogo    || "",
            }))

            router.push("/component/admin")
        } catch (err) {
            setError("Something went wrong. Try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-blue-500 p-2 rounded-xl">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-800">EduManage</h1>
                        <p className="text-xs text-gray-400">Admin Portal</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
                <p className="text-xs text-gray-400 mb-8">Sign in to your admin account</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                        <input type="email" placeholder="admin@school.com"
                            className="w-full border border-gray-200 rounded-xl p-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none text-black focus:ring-2 focus:ring-blue-500 pr-10"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="bg-blue-200 text-black py-3 rounded-xl text-sm font-semibold hover:bg-blue-100 disabled:opacity-50 mt-2">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AdminLogin