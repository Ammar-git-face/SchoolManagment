// "use client"
// import { useState, useEffect, useRef } from "react"
// import { Upload, Save, School, Phone, MapPin, Mail, CheckCircle, AlertCircle, Image, X } from "lucide-react"
// import Sidebar from "../sidevar"
// import { authFetch, API_BASE, getUser, setUser } from "../utils/api"
// import { API } from "../../../config/api"

// export default function SchoolSettings() {
//     const [sidebarOpen, setSidebarOpen] = useState(false)
//     const [info, setInfo]               = useState({ name: "", email: "", phone: "", address: "", logo: "", schoolCode: "" })
//     const [logoPreview, setLogoPreview] = useState("")
//     const [saving, setSaving]           = useState(false)
//     const [uploading, setUploading]     = useState(false)
//     const [msg, setMsg]                 = useState(null)
//     const fileRef                       = useRef()

//     const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000) }

//     const fetchInfo = async () => {
//         try {
//             const res  = await authFetch(`${API_BASE}/school/info`)
//             const data = await res.json()
//             if (!res.ok) return flash("error", data.error || "Failed to load school info")
//             setInfo(data)
//             setLogoPreview(data.logo || "")
//         } catch { flash("error", "Could not load school info") }
//     }

//     useEffect(() => { fetchInfo() }, [])

//     const handleFileChange = (e) => {
//         const file = e.target.files[0]
//         if (!file) return
//         if (!file.type.startsWith("image/"))
//             return flash("error", "Please select an image file")
//         if (file.size > 500 * 1024)
//             return flash("error", "Image must be under 500KB. Resize it first.")
//         const reader = new FileReader()
//         reader.onload = () => setLogoPreview(reader.result)
//         reader.readAsDataURL(file)
//     }

//     const handleUploadLogo = async () => {
//         if (!logoPreview || logoPreview === info.logo)
//             return flash("error", "Select a new image first")
//         setUploading(true)
//         try {
//             const res  = await authFetch(`${API_BASE}/school/logo`, {
//                 method: "PUT",
//                 body:   JSON.stringify({ logo: logoPreview })
//             })
//             const data = await res.json()
//             if (!res.ok) return flash("error", data.error || "Upload failed")

//             // ✅ FIX: Use setUser helper → fires "userUpdated" event → sidebar re-reads
//             // Don't store raw base64 in localStorage — just update the key
//             // Sidebar re-fetches from server on the event
//             setUser({ schoolLogo: logoPreview })

//             flash("success", "Logo updated! Sidebar will refresh.")
//             setInfo(prev => ({ ...prev, logo: logoPreview }))
//         } catch { flash("error", "Something went wrong") }
//         finally { setUploading(false) }
//     }

//     const handleSaveInfo = async () => {
//         if (!info.name) return flash("error", "School name is required")
//         setSaving(true)
//         try {
//             const res  = await authFetch(`${API_BASE}/school/update`, {
//                 method: "PUT",
//                 body:   JSON.stringify({ name: info.name, phone: info.phone, address: info.address })
//             })
//             const data = await res.json()
//             if (!res.ok) return flash("error", data.error || "Update failed")
//             setUser({ schoolName: info.name })
//             flash("success", "School info updated")
//         } catch { flash("error", "Something went wrong") }
//         finally { setSaving(false) }
//     }

//     return (
//         <div className="flex min-h-screen bg-gray-50">
//             <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//             <div className="flex-1 md:ml-64 min-h-screen">
//                 {/* Mobile header */}
//                 <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
//                     <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
//                         <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                         </svg>
//                     </button>
//                     <h1 className="font-semibold text-black text-sm">School Settings</h1>
//                     <div className="w-8" />
//                 </div>

//                 <div className="px-4 md:px-8 pt-6 pb-12 max-w-3xl mx-auto w-full">
//                     <div className="mb-6">
//                         <h1 className="text-xl md:text-2xl font-bold text-black">School Settings</h1>
//                         <p className="text-xs text-gray-400 mt-1">Manage your school profile and logo</p>
//                     </div>

//                     {msg && (
//                         <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-5 border
//                             ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
//                             {msg.type === "success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
//                             {msg.text}
//                         </div>
//                     )}

//                     {/* Logo upload */}
//                     <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 mb-5">
//                         <h2 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
//                             <Image size={15} className="text-blue-400" /> School Logo
//                         </h2>
//                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
//                             <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
//                                 {logoPreview ? (
//                                     <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
//                                 ) : (
//                                     <School size={28} className="text-gray-300" />
//                                 )}
//                             </div>
//                             <div className="flex-1 w-full">
//                                 <p className="text-xs text-black mb-3">PNG, JPG up to 500KB. Will display in sidebar and report cards.</p>
//                                 <div className="flex flex-wrap gap-2">
//                                     <button onClick={() => fileRef.current?.click()}
//                                         className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl text-xs font-medium transition">
//                                         <Upload size={13} /> Choose Image
//                                     </button>
//                                     {logoPreview && logoPreview !== info.logo && (
//                                         <button onClick={handleUploadLogo} disabled={uploading}
//                                             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition disabled:opacity-50">
//                                             {uploading ? "Uploading..." : <><Save size={13} /> Save Logo</>}
//                                         </button>
//                                     )}
//                                     {logoPreview && (
//                                         <button onClick={() => { setLogoPreview(info.logo || ""); fileRef.current.value = "" }}
//                                             className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-400 transition">
//                                             <X size={13} />
//                                         </button>
//                                     )}
//                                 </div>
//                                 <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* School info */}
//                     <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
//                         <h2 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
//                             <School size={15} className="text-blue-400" /> School Information
//                         </h2>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="sm:col-span-2">
//                                 <label className="text-xs text-black mb-1 block">School Name *</label>
//                                 <input value={info.name} onChange={e => setInfo(p => ({...p, name: e.target.value}))}
//                                     className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
//                                     placeholder="School name" />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-black mb-1 block flex items-center gap-1"><Mail size={10}/> Email</label>
//                                 <input value={info.email} disabled
//                                     className="w-full border border-gray-100 bg-gray-50 rounded-xl text-black px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-black mb-1 block flex items-center gap-1"><Phone size={10}/> Phone</label>
//                                 <input value={info.phone || ""} onChange={e => setInfo(p => ({...p, phone: e.target.value}))}
//                                     className="w-full border border-gray-200 rounded-xl text-black px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="+234..." />
//                             </div>
//                             <div className="sm:col-span-2">
//                                 <label className="text-xs text-black mb-1 block flex items-center gap-1"><MapPin size={10}/> Address</label>
//                                 <input value={info.address || ""} onChange={e => setInfo(p => ({...p, address: e.target.value}))}
//                                     className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="School address" />
//                             </div>
//                             <div className="sm:col-span-2">
//                                 <label className="text-xs text-black mb-1 block">School Code</label>
//                                 <input value={info.schoolCode || ""} disabled
//                                     className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 text-black py-2.5 text-sm text-gray-400 font-mono cursor-not-allowed" />
//                             </div>
//                         </div>
//                         <button onClick={handleSaveInfo} disabled={saving}
//                             className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
//                             {saving ? "Saving..." : <><Save size={15} /> Save Changes</>}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }


"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Save, School, Phone, MapPin, Mail, CheckCircle, AlertCircle, Image, X, CreditCard, Building2 } from "lucide-react"
import Sidebar from "../sidevar"
import { authFetch, API_BASE, getUser, setUser } from "../utils/api"
import { API } from "../../../config/api"


export default function SchoolSettings() {
    const router =useRouter()
      const [sidebarOpen, setSidebarOpen] = useState(false)
    const [info, setInfo]               = useState({ name: "", email: "", phone: "", address: "", logo: "", schoolCode: "" })
    const [logoPreview, setLogoPreview] = useState("")
    const [saving, setSaving]           = useState(false)
    const [uploading, setUploading]     = useState(false)
    const [msg, setMsg]                 = useState(null)
    const fileRef                       = useRef()

    // ── Payment details state ─────────────────────────────────────────────────
    const [banks,         setBanks]         = useState([])
    const [bankDetails,   setBankDetails]   = useState({ accountNumber: "", bankCode: "", bankName: "", accountName: "" })
    const [isConfigured,  setIsConfigured]  = useState(false)
    const [savingPayment, setSavingPayment] = useState(false)
    const [paymentMsg,    setPaymentMsg]    = useState(null)
    const [resolving,     setResolving]     = useState(false)

    const flash        = (type, text) => { setMsg({ type, text });        setTimeout(() => setMsg(null), 4000) }
    const flashPayment = (type, text) => { setPaymentMsg({ type, text }); setTimeout(() => setPaymentMsg(null), 5000) }

    const fetchInfo = async () => {
        try {
            const res  = await authFetch(`${API_BASE}/school/info`)
            const data = await res.json()
            if (!res.ok) return flash("error", data.error || "Failed to load school info")
            setInfo(data)
            setLogoPreview(data.logo || "")
        } catch { flash("error", "Could not load school info") }
    }

    const fetchPaymentDetails = async () => {
        try {
            const [banksRes, detailsRes] = await Promise.all([
                authFetch(`${API}/fees/banks`),
                authFetch(`${API}/fees/bank-details`)
            ])
            if (banksRes.ok) {
                const banksData = await banksRes.json()
                setBanks(Array.isArray(banksData) ? banksData : [])
            }
            if (detailsRes.ok) {
                const detailsData = await detailsRes.json()
                if (detailsData.bankDetails?.accountNumber) setBankDetails(detailsData.bankDetails)
                setIsConfigured(detailsData.isConfigured || false)
            }
        } catch { console.log("Failed to load payment details") }
    }

    useEffect(() => {
        fetchInfo()
        fetchPaymentDetails()
    }, [])

    // ── Auto-resolve account name when account number + bank code are ready ───
    const resolveAccountName = async (accountNumber, bankCode) => {
        if (accountNumber.length !== 10 || !bankCode) return
        setResolving(true)
        setBankDetails(d => ({ ...d, accountName: "" }))
        try {
            const res  = await authFetch(`${API}/fees/resolve-account`, {
                method: "POST",
                body:   JSON.stringify({ accountNumber, bankCode })
            })
            const data = await res.json()
            if (res.ok && data.accountName) {
                setBankDetails(d => ({ ...d, accountName: data.accountName }))
            } else {
                setBankDetails(d => ({ ...d, accountName: "" }))
                flashPayment("error", "Could not verify account number. Check the details and try again.")
            }
        } catch { console.log("resolve failed") }
        finally { setResolving(false) }
    }
    
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith("image/"))
            return flash("error", "Please select an image file")
        if (file.size > 500 * 1024)
            return flash("error", "Image must be under 500KB. Resize it first.")
        const reader = new FileReader()
        reader.onload = () => setLogoPreview(reader.result)
        reader.readAsDataURL(file)
    }

    const handleUploadLogo = async () => {
        if (!logoPreview || logoPreview === info.logo)
            return flash("error", "Select a new image first")
        setUploading(true)
        try {
            const res  = await authFetch(`${API_BASE}/school/logo`, {
                method: "PUT",
                body:   JSON.stringify({ logo: logoPreview })
            })
            const data = await res.json()
            if (!res.ok) return flash("error", data.error || "Upload failed")
            setUser({ schoolLogo: logoPreview })
            flash("success", "Logo updated! Sidebar will refresh.")
            setInfo(prev => ({ ...prev, logo: logoPreview }))
        } catch { flash("error", "Something went wrong") }
        finally { setUploading(false) }
    }

    const handleSaveInfo = async () => {
        if (!info.name) return flash("error", "School name is required")
        setSaving(true)
        try {
            const res  = await authFetch(`${API_BASE}/school/update`, {
                method: "PUT",
                body:   JSON.stringify({ name: info.name, phone: info.phone, address: info.address })
            })
            const data = await res.json()
            if (!res.ok) return flash("error", data.error || "Update failed")
            setUser({ schoolName: info.name })
            flash("success", "School info updated")
        } catch { flash("error", "Something went wrong") }
        finally { setSaving(false) }
    }

    // ── Save payment details → creates Flutterwave subaccount ────────────────
    const handleSavePayment = async () => {
        const { accountNumber, bankCode, accountName } = bankDetails
        if (!accountNumber || !bankCode || !accountName)
            return flashPayment("error", "Please fill in bank and account number — account name will auto-fill")
        if (accountNumber.length !== 10)
            return flashPayment("error", "Account number must be 10 digits")
        if (resolving)
            return flashPayment("error", "Please wait for account verification to complete")

        setSavingPayment(true)
        try {
            const selectedBank = banks.find(b => b.code === bankDetails.bankCode)
            const payload      = { ...bankDetails, bankName: selectedBank?.name || bankDetails.bankName }

            const res  = await authFetch(`${API}/fees/save-bank-details`, {
                method: "POST",
                body:   JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) return flashPayment("error", data.error || "Failed to save payment details")

            setIsConfigured(true)
            setBankDetails({ ...payload, accountName: data.accountName || payload.accountName })
            flashPayment("success", `Payment account configured for ${data.accountName || accountName}. Fee payments and salary transfers will now use your bank account.`)
        } catch { flashPayment("error", "Something went wrong") }
        finally { setSavingPayment(false) }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile header */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-black text-sm">School Settings</h1>
                    <div className="w-8" />
                </div>

                <div className="px-4 md:px-8 pt-6 pb-12 max-w-3xl mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-black">School Settings</h1>
                        <p className="text-xs text-gray-400 mt-1">Manage your school profile and logo</p>
                    </div>

                    {msg && (
                        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-5 border
                            ${msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            {msg.type === "success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                            {msg.text}
                        </div>
                    )}

                    {/* Logo upload */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 mb-5">
                        <h2 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
                            <Image size={15} className="text-blue-400" /> School Logo
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <School size={28} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <p className="text-xs text-black mb-3">PNG, JPG up to 500KB. Will display in sidebar and report cards.</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl text-xs font-medium transition">
                                        <Upload size={13} /> Choose Image
                                    </button>
                                    {logoPreview && logoPreview !== info.logo && (
                                        <button onClick={handleUploadLogo} disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition disabled:opacity-50">
                                            {uploading ? "Uploading..." : <><Save size={13} /> Save Logo</>}
                                        </button>
                                    )}
                                    {logoPreview && (
                                        <button onClick={() => { setLogoPreview(info.logo || ""); fileRef.current.value = "" }}
                                            className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-400 transition">
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        </div>
                    </div>

                    {/* School info */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 mb-5">
                        <h2 className="text-sm font-semibold text-black mb-4 flex items-center gap-2">
                            <School size={15} className="text-blue-400" /> School Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="text-xs text-black mb-1 block">School Name *</label>
                                <input value={info.name} disabled onChange={e => setInfo(p => ({...p, name: e.target.value}))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                                    placeholder="School name" />
                            </div>
                            <div>
                                <label className="text-xs text-black mb-1 block flex items-center gap-1"><Mail size={10}/> Email</label>
                                <input value={info.email} disabled
                                    className="w-full border border-gray-100 bg-gray-50 rounded-xl text-black px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-xs text-black mb-1 block flex items-center gap-1"><Phone size={10}/> Phone</label>
                                <input value={info.phone || ""} onChange={e => setInfo(p => ({...p, phone: e.target.value}))}
                                    className="w-full border border-gray-200 rounded-xl text-black px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+234..." />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs text-black mb-1 block flex items-center gap-1"><MapPin size={10}/> Address</label>
                                <input value={info.address || ""} onChange={e => setInfo(p => ({...p, address: e.target.value}))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="School address" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs text-black mb-1 block">School Code</label>
                                <input value={info.schoolCode || ""} disabled
                                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 text-black py-2.5 text-sm text-gray-400 font-mono cursor-not-allowed" />
                            </div>
                        </div>
                     <div className="flex items-center gap-4">
                     <button  onClick={() => router.push("/component/auth/owner")}
                            className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                          Owner Dashboard
                        </button>
                        <button onClick={handleSaveInfo} disabled={saving}
                            className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                            {saving ? "Saving..." : <><Save size={15} /> Save Changes</>}
                        </button>
                        </div> 
                    </div>

                    {/* ── Payment Details ───────────────────────────────────────────────── */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-sm font-semibold text-black flex items-center gap-2">
                                <CreditCard size={15} className="text-blue-400" /> Payment Details
                            </h2>
                            {isConfigured && (
                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                    <CheckCircle size={11} /> Configured
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Enter your school's bank account. Fee payments from parents and teacher salary transfers will go directly to this account.
                        </p>

                        {paymentMsg && (
                            <div className={`flex items-start gap-2 text-xs px-4 py-3 rounded-xl mb-4 border
                                ${paymentMsg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                {paymentMsg.type === "success"
                                    ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0"/>
                                    : <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>}
                                {paymentMsg.text}
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            {/* Bank selector */}
                            <div>
                                <label className="text-xs text-black mb-1 block flex items-center gap-1">
                                    <Building2 size={10}/> Bank
                                </label>
                                <select
                                    value={bankDetails.bankCode}
                                    onChange={e => {
                                        setBankDetails(d => ({ ...d, bankCode: e.target.value }))
                                        resolveAccountName(bankDetails.accountNumber, e.target.value)
                                    }}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">— Select your bank —</option>
                                    {banks.map(b => (
                                        <option key={b.code} value={b.code}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Account number */}
                            <div>
                                <label className="text-xs text-black mb-1 block">Account Number</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    placeholder="10-digit account number"
                                    value={bankDetails.accountNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "")
                                        setBankDetails(d => ({ ...d, accountNumber: val }))
                                        resolveAccountName(val, bankDetails.bankCode)
                                    }}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            {/* Account name — auto filled */}
                            <div>
                                <label className="text-xs text-black mb-1 block">Account Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder={resolving ? "Verifying account..." : "Auto-filled after entering account number"}
                                        value={bankDetails.accountName}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black bg-gray-50 cursor-not-allowed focus:outline-none" />
                                    {resolving && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {bankDetails.accountName && !resolving && (
                                        <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                            <p className="text-xs text-blue-700">
                                <strong>How it works:</strong> When you save, a secure payment account is created linked to your bank. All school fee collections go directly to your account. Teacher salaries are also transferred from this account.
                            </p>
                        </div>

                        <button
                            onClick={handleSavePayment}
                            disabled={savingPayment || resolving || !bankDetails.accountName}
                            className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                            {savingPayment ? "Setting up account..." : <><Save size={15} /> Save Payment Details</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}