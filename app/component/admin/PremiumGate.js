// app/component/admin/PremiumGate.js
// ✅ Wrap any premium-only page with this component
// Usage:
//   import PremiumGate from '../PremiumGate'
//   export default function MessagesPage() {
//       return <PremiumGate><ActualPageContent /></PremiumGate>
//   }

"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Zap, ArrowRight } from "lucide-react"

export default function PremiumGate({ children, feature = "this feature" }) {
    const [plan,    setPlan]    = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        // plan is stored on the user object at login
        // If not available, default to showing content (backend will block anyway)
        const p = user.plan || "trial"
        setPlan(p)
        setLoading(false)
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    // Allow trial and premium
    if (plan === "premium" || plan === "trial") return children

    // Block free plan
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">

                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Lock size={28} className="text-indigo-600" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h2>
                <p className="text-sm text-gray-500 mb-6">
                    {feature === "this feature"
                        ? "This feature is only available on the Premium plan."
                        : `${feature} is only available on the Premium plan.`
                    } Upgrade your school to unlock messaging, PTA meetings, and online payments.
                </p>

                <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-semibold text-indigo-700 mb-2">Premium includes:</p>
                    {[
                        "Real-time messaging between admin, teachers & parents",
                        "PTA meeting scheduling and management",
                        "Online fee payments via Flutterwave",
                        "Teacher salary bank transfers",
                        "Priority support"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                            <Zap size={12} className="text-indigo-500 flex-shrink-0" />
                            <span className="text-xs text-indigo-800">{item}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => router.push("/component/admin/settings")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition">
                    Upgrade to Premium <ArrowRight size={15} />
                </button>

                <p className="text-xs text-gray-400 mt-3">
                    Contact your school administrator or email amarhussaini72@gmail.com
                </p>
            </div>
        </div>
    )
}