"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Eye, EyeOff } from "lucide-react"
import { API_BASE } from "../../admin/utils/api"
// import { API } from "../../../config/api"

const ParentLogin = () => {
    const router = useRouter()
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [error,    setError]    = useState("")
    const [loading,  setLoading]  = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/auth/parent/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || "Login failed")

            // ✅ Backend returns FLAT: { token, _id, fullname, email, schoolCode, children, role }
            // NOT nested under data.user — that was the redirect loop bug
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify({
                id:         data._id       || "",
                _id:        data._id       || "",
                name:       data.fullname  || data.name || "",
                fullname:   data.fullname  || data.name || "",
                email:      data.email     || email,
                role:       "parent",
                schoolCode: data.schoolCode || "",
                children:   Array.isArray(data.children) ? data.children : [],
            }))

            router.push("/component/parent")
        } catch {
            setError("Could not connect to server")
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                        <Users size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Parent Portal</h1>
                        <p className="text-xs text-gray-400">Sign in to track your children</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                        <input type="email" placeholder="your@email.com" required
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">Password</label>
                        <input type={showPass ? "text" : "password"} placeholder="Your password" required
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                            value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition text-sm mt-2">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <button onClick={() => router.push("/component/auth/parentSignup")}
                        className="text-purple-500 hover:underline font-medium">Register</button>
                </p>
            </div>
        </div>
    )
}

export default ParentLogin