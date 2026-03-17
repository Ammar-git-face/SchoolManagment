'use client'
import { useState } from 'react'
import { API } from "../../../config/api"
import { useRouter } from 'next/navigation'

export default function OwnerLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // const [showPass, setShowPass] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) return setError('Please fill in all fields')
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`${API}/payroll/owner-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || 'Login failed')

            localStorage.setItem('ownerId', data._id)
            localStorage.setItem('ownerName', data.fullname)
            localStorage.setItem('ownerEmail', data.email)
            localStorage.setItem('schoolName', data.schoolName)
            localStorage.setItem('ownerPlan', data.plan)
            localStorage.setItem('role', 'owner')

            router.push('/component/Owner')
        } catch {
            setError('Server error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-gray-500 rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className=" text-2xl">🏫</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">School Owner Portal</h1>
                    <p className="text-gray-400 text-sm mt-1">Sign in to manage your school</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block font-medium">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="owner@school.com"
                            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block font-medium">Password</label>
                        <div className="relative">
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
                        </div>
                    </div>
                    <button onClick={handleLogin} disabled={loading}
                        className="w-full text-blue-500 bg-blue-200 h-8 hover:bg-blue-50 rounded-xl font-semibold border mt-2">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    )
}