// =====================================================
// Add this component inside admin Settings page
// Admin can upload school logo from their settings
// =====================================================
"use client"
import { useState, useRef } from "react"
import { Upload, Check, School } from "lucide-react"
import { API } from "../../../config/api"

const SchoolLogoUpload = () => {
    const [preview,   setPreview]   = useState("")
    const [uploading, setUploading] = useState(false)
    const [msg,       setMsg]       = useState(null)
    const fileRef = useRef()

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 500_000)
            return setMsg({ type: "error", text: "Logo must be under 500KB" })

        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleUpload = async () => {
        if (!preview) return
        setUploading(true)
        setMsg(null)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API}/school/logo`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ logo: preview })
            })
            const data = await res.json()
            if (!res.ok) return setMsg({ type: "error", text: data.error })

            // Update localStorage so sidebar shows new logo immediately
            const stored = JSON.parse(localStorage.getItem("user") || "{}")
            stored.schoolLogo = preview
            localStorage.setItem("user", JSON.stringify(stored))

            setMsg({ type: "success", text: "Logo updated! Reload to see it in the sidebar." })
        } catch (err) {
            setMsg({ type: "error", text: "Upload failed" })
        } finally { setUploading(false) }
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">School Logo</p>

            {msg && (
                <div className={`text-xs p-3 rounded-xl mb-4 ${msg.type === "success"
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"}`}>
                    {msg.text}
                </div>
            )}

            <div className="flex items-center gap-5">
                {/* Preview */}
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50">
                    {preview ? (
                        <img src={preview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                        <School size={28} className="text-gray-300" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">
                        Upload your school logo. It will appear in all sidebars and on report cards.
                        Max 500KB, PNG or JPG.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => fileRef.current.click()}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition">
                            <Upload size={13} /> Choose File
                        </button>
                        {preview && (
                            <button onClick={handleUpload} disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition disabled:opacity-50">
                                <Check size={13} />
                                {uploading ? "Saving..." : "Save Logo"}
                            </button>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden"
                        onChange={handleFile} />
                </div>
            </div>
        </div>
    )
}

export default SchoolLogoUpload

// =====================================================
// Usage: drop this inside your admin settings page:
// import SchoolLogoUpload from "./SchoolLogoUpload"
// <SchoolLogoUpload />
// =====================================================