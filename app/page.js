"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Shield, BookOpen, Users, ArrowRight, BarChart3, MessageCircle, CheckCircle, ChevronRight, Star } from "lucide-react"
import { EdvanceIcon } from "./component/EdvanceLogo"

const useCounter = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime = null
        const step = (ts) => {
            if (!startTime) startTime = ts
            const p = Math.min((ts - startTime) / duration, 1)
            setCount(Math.floor(p * target))
            if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, duration, start])
    return count
}

export default function LandingPage() {
    const router = useRouter()
    const [visible, setVisible] = useState(false)
    useEffect(() => { setVisible(true) }, [])

    const schools  = useCounter(500,   1800, visible)
    const students = useCounter(12000, 2200, visible)
    const teachers = useCounter(3400,  2000, visible)

    const roles = [
        {
            key: "admin", label: "Admin", sublabel: "Principal / School Manager",
            icon: <Shield size={28} />,
            desc: "Manage students, teachers, fees, results and announcements all in one place.",
            route: "/component/auth/admin", accent: "#3b82f6", badge: "School Hub"
        },
        {
            key: "teacher", label: "Teacher", sublabel: "Class Teacher / Subject Teacher",
            icon: <BookOpen size={28} />,
            desc: "Enter results, take attendance, message parents and manage your classes.",
            route: "/component/auth/teacherLogin", accent: "#10b981", badge: "Classroom"
        },
        {
            key: "parent", label: "Parent", sublabel: "Parent / Guardian",
            icon: <Users size={28} />,
            desc: "Track your child's results, attendance, fee payments and school updates.",
            route: "/component/auth/parentLogin", accent: "#8b5cf6", badge: "Family"
        },
    ]

    const features = [
        { icon: <BarChart3 size={20} />, title: "Real-time Dashboard", desc: "Live stats on students, fees, attendance and performance" },
        { icon: <EdvanceIcon size={20} />, title: "Smart Results",      desc: "Teacher submits → Admin approves → Parent sees instantly" },
        { icon: <MessageCircle size={20}/>, title: "Built-in Messaging",  desc: "Direct communication between admin, teachers and parents" },
        { icon: <CheckCircle size={20} />, title: "Fee Tracking",         desc: "Flutterwave-powered payments with full audit trail" },
    ]

    const S = {
        page:    { backgroundColor: "#050e1f", minHeight: "100vh", color: "#fff", overflowX: "hidden", fontFamily: "system-ui, sans-serif", position: "relative" },
        dim50:   { color: "rgba(255,255,255,0.5)" },
        dim40:   { color: "rgba(255,255,255,0.4)" },
        dim30:   { color: "rgba(255,255,255,0.3)" },
        dim20:   { color: "rgba(255,255,255,0.2)" },
        dim70:   { color: "rgba(255,255,255,0.7)" },
        serif:   { fontFamily: "Georgia, 'Times New Roman', serif" },
        mono:    { fontFamily: "monospace" },
    }

    return (
        <div style={S.page}>
            {/* Grid overlay */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.04,
                backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                backgroundSize: "80px 80px" }} />
            {/* Glow top-left */}
            <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)" }} />
            {/* Glow bottom-right */}
            <div style={{ position: "fixed", bottom: -200, right: -200, width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>

                {/* NAV */}
                <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="16" fill="#0f172a"/>
                            <polygon points="16,6 26,11 16,15 6,11" fill="#ffffff"/>
                            <polygon points="16,15 26,11 26,14 16,18" fill="#c7d2fe"/>
                            <polygon points="16,15 6,11 6,14 16,18" fill="#818cf8"/>
                            <rect x="14.5" y="15" width="3" height="7" rx="1" fill="#ffffff"/>
                            <circle cx="16" cy="23" r="2" fill="#818cf8"/>
                            <line x1="24" y1="12" x2="24" y2="17" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="24" cy="19" r="1.5" fill="#818cf8"/>
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: "#fff" }}>edvance</span>
                    </div>
                    <button onClick={() => router.push("/component/auth/register")}
                        style={{ fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.color = "#60a5fa" }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}>
                        Register School
                    </button>
                </nav>

                {/* HERO */}
                <section style={{ padding: "80px 24px 64px", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: 12, padding: "6px 16px", borderRadius: 999, marginBottom: 32, letterSpacing: "0.05em" }}>
                        <Star size={11} fill="currentColor" /> Nigeria's School Management Platform
                    </div>

                    <h1 style={{ ...S.serif, fontSize: "clamp(2.2rem,6vw,4.5rem)", fontWeight: 700, lineHeight: 1.05, marginBottom: 24,
                        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
                        <span style={{ color: "#fff" }}>Every school </span>
                        <span style={{ background: "linear-gradient(135deg,#60a5fa 0%,#a78bfa 50%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            deserves great management.
                        </span>
                    </h1>

                    <p style={{ ...S.dim50, fontSize: 16, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
                        One platform connecting school admins, teachers and parents.
                        Results, fees, attendance, messaging — everything in sync.
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                        <button onClick={() => router.push("/component/auth/register")}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 14, padding: "14px 28px", borderRadius: 16, border: "none", cursor: "pointer", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                            onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}>
                            Register Your School <ArrowRight size={16} />
                        </button>
                        <button onClick={() => document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" })}
                            style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 14, padding: "14px 28px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff" }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}>
                            I already have an account
                        </button>
                    </div>
                </section>

                {/* STATS */}
                <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px" }}>
                    <div style={{ maxWidth: 600, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "center" }}>
                        {[{ v: schools, l: "Schools" }, { v: students, l: "Students" }, { v: teachers, l: "Teachers" }].map((s, i) => (
                            <div key={i}>
                                <p style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 700, marginBottom: 4 }}>{s.v.toLocaleString()}+</p>
                                <p style={{ ...S.dim40, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.l}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FEATURES */}
                <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
                    <p style={{ ...S.dim30, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", textAlign: "center", marginBottom: 12 }}>Platform Features</p>
                    <h2 style={{ ...S.serif, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, textAlign: "center", marginBottom: 48, color: "#fff" }}>Built for Nigerian schools</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20,
                                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
                                transition: `opacity 0.6s ease ${i * 0.1 + 0.4}s, transform 0.6s ease ${i * 0.1 + 0.4}s` }}
                                onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(59,130,246,0.35)"; e.currentTarget.style.background = "rgba(59,130,246,0.06)" }}
                                onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.2)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ ...S.dim40, fontSize: 12, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LOGIN SECTION */}
                <section id="login-section" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
                    <p style={{ ...S.dim30, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", textAlign: "center", marginBottom: 12 }}>Access Portal</p>
                    <h2 style={{ ...S.serif, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, textAlign: "center", color: "#fff", marginBottom: 8 }}>Who are you logging in as?</h2>
                    <p style={{ ...S.dim40, fontSize: 14, textAlign: "center", marginBottom: 48, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
                        Select your role to go to the correct login page
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
                        {roles.map((role, i) => (
                            <button key={role.key} onClick={() => router.push(role.route)}
                                style={{ textAlign: "left", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, cursor: "pointer",
                                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
                                    transition: `opacity 0.7s ease ${i * 0.15 + 0.2}s, transform 0.7s ease ${i * 0.15 + 0.2}s` }}
                                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${role.accent}66`; e.currentTarget.style.background = role.accent + "18" }}
                                onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, marginBottom: 20, display: "inline-block", background: role.accent + "22", color: role.accent }}>
                                    {role.badge}
                                </span>
                                <div style={{ width: 48, height: 48, borderRadius: 16, background: role.accent + "22", color: role.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                    {role.icon}
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{role.label}</h3>
                                <p style={{ ...S.dim40, fontSize: 12, marginBottom: 12 }}>{role.sublabel}</p>
                                <p style={{ ...S.dim50, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{role.desc}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: role.accent }}>
                                    Log in as {role.label} <ChevronRight size={14} />
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* CTA BANNER */}
                <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ borderRadius: 24, border: "1px solid rgba(59,130,246,0.25)", padding: "64px 32px", textAlign: "center", position: "relative", overflow: "hidden",
                        background: "linear-gradient(135deg,rgba(37,99,235,0.15) 0%,rgba(124,58,237,0.1) 100%)" }}>
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 0%,rgba(37,99,235,0.2) 0%,transparent 60%)" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ ...S.serif, fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                                Ready to bring your school online?
                            </h2>
                            <p style={{ ...S.dim50, fontSize: 14, marginBottom: 32, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
                                Registration takes less than 2 minutes. Your school code is generated instantly.
                            </p>
                            <button onClick={() => router.push("/component/auth/register")}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#1d4ed8", fontWeight: 700, fontSize: 14, padding: "14px 28px", borderRadius: 16, border: "none", cursor: "pointer", transition: "background 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                                Register Your School — It's Free <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center" }}>
                    <p style={{ ...S.dim20, fontSize: 12 }}>© 2025 Edvance · Built for Nigerian Schools</p>
                </footer>
            </div>
        </div>
    )
}