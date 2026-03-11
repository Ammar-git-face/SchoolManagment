'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../sidevar'
import { authFetch } from "../utils/api"

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState([])
    const [liveClasses, setLiveClasses] = useState([])   // ✅ from DB not hardcoded
    const [filterClass, setFilterClass] = useState('')
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [message, setMessage] = useState('')

    const [addModal, setAddModal] = useState(false)
    const [newSubject, setNewSubject] = useState({ name: '', className: '', maxCA: 40, maxExam: 60 })
    const [adding, setAdding] = useState(false)

    const [editModal, setEditModal] = useState(null)
    const [saving, setSaving] = useState(false)

    const [bulkModal, setBulkModal] = useState(false)
    const [bulkClass, setBulkClass] = useState('')
    const [bulkText, setBulkText] = useState('')
    const [bulkMaxCA, setBulkMaxCA] = useState(40)
    const [bulkMaxExam, setBulkMaxExam] = useState(60)
    const [bulkAdding, setBulkAdding] = useState(false)

    // ✅ fetch live classes from the class route
    const fetchLiveClasses = async () => {
        try {
            const res = await authFetch('http://localhost:5000/class')
            const data = await res.json()
            setLiveClasses(Array.isArray(data) ? data : [])
        } catch (err) { console.error('fetchLiveClasses:', err.message) }
    }

    const fetchSubjects = useCallback(async () => {
        setLoading(true)
        try {
            let url = 'http://localhost:5000/academic/all'
            if (filterClass) url += `?className=${encodeURIComponent(filterClass)}`
            const res = await authFetch(url)
            const data = await res.json()
            setSubjects(Array.isArray(data) ? data : [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [filterClass])

    useEffect(() => {
        fetchSubjects()
        fetchLiveClasses()
    }, [fetchSubjects])

    const showMessage = (msg) => {
        setMessage(msg)
        setTimeout(() => setMessage(''), 3500)
    }

    const handleAdd = async () => {
        if (!newSubject.name.trim() || !newSubject.className) {
            return showMessage('❌ Subject name and class are required')
        }
        setAdding(true)
        try {
            const res = await authFetch('http://localhost:5000/academic/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject)
            })
            const data = await res.json()
            if (!res.ok) return showMessage(`❌ ${data.error}`)
            showMessage('✅ Subject added!')
            setAddModal(false)
            setNewSubject({ name: '', className: '', maxCA: 40, maxExam: 60 })
            fetchSubjects()
        } catch { showMessage('❌ Server error') }
        finally { setAdding(false) }
    }

    const handleEdit = async () => {
        setSaving(true)
        try {
            const res = await authFetch(`http://localhost:5000/academic/update/${editModal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editModal.name, maxCA: editModal.maxCA, maxExam: editModal.maxExam })
            })
            const data = await res.json()
            if (!res.ok) return showMessage(`❌ ${data.error}`)
            showMessage('✅ Subject updated!')
            setEditModal(null)
            fetchSubjects()
        } catch { showMessage('❌ Server error') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Remove "${name}"? This won't delete existing results.`)) return
        try {
            await authFetch(`http://localhost:5000/academic/delete/${id}`, { method: 'DELETE' })
            showMessage('✅ Subject removed')
            fetchSubjects()
        } catch { showMessage('❌ Error removing subject') }
    }

    const handleBulkAdd = async () => {
        if (!bulkClass || !bulkText.trim()) return showMessage('❌ Select a class and enter subjects')
        const names = bulkText.split('\n').map(s => s.trim()).filter(Boolean)
        if (!names.length) return showMessage('❌ No subjects found')
        setBulkAdding(true)
        let successCount = 0, skipCount = 0
        for (const name of names) {
            const res = await authFetch('http://localhost:5000/academic/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, className: bulkClass, maxCA: bulkMaxCA, maxExam: bulkMaxExam })
            })
            if (res.ok) successCount++
            else skipCount++
        }
        showMessage(`✅ Added ${successCount} subjects${skipCount > 0 ? `, ${skipCount} skipped (duplicates)` : ''}`)
        setBulkModal(false)
        setBulkText('')
        fetchSubjects()
        setBulkAdding(false)
    }

    const grouped = subjects.reduce((acc, s) => {
        if (!acc[s.className]) acc[s.className] = []
        acc[s.className].push(s)
        return acc
    }, {})

    // ✅ class names from DB for dropdowns
    const classNames = liveClasses.map(c => c.name).filter(Boolean)

    const ClassDropdown = ({ value, onChange, placeholder = "Select class" }) => (
        <select value={value} onChange={onChange}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{placeholder}</option>
            {classNames.length === 0
                ? <option disabled>No classes found — add classes first</option>
                : classNames.map(c => <option key={c} value={c}>{c}</option>)
            }
        </select>
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-semibold text-gray-800">Subjects</h1>
                    <div className="w-8" />
                </div>

                <div className="p-4 md:p-8 max-w-5xl mx-auto">
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
                            <p className="text-sm text-gray-400 mt-1">Define subjects per class — used for CA and Exam entry</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setBulkModal(true)}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition">
                                Bulk Add
                            </button>
                            <button onClick={() => setAddModal(true)}
                                className="px-4 py-2 bg-blue-200 text-black rounded-xl text-sm font-medium hover:bg-blue-400 transition">
                                + Add Subject
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 md:hidden">
                        <button onClick={() => setBulkModal(true)} className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium">Bulk Add</button>
                        <button onClick={() => setAddModal(true)} className="flex-1 py-2 bg-blue-600 text-black rounded-xl text-sm font-medium">+ Add Subject</button>
                    </div>

                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    {/* ✅ no classes warning */}
                    {classNames.length === 0 && (
                        <div className="mb-4 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl text-sm">
                            ⚠️ No classes found. Go to <strong>Classes</strong> page and add classes first before adding subjects.
                        </div>
                    )}

                    {/* Filter */}
                    <div className="bg-white rounded-xl shadow p-4 mb-5 flex flex-wrap gap-3 items-center">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Filter by Class</label>
                            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Classes</option>
                                {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="text-sm text-gray-400 mt-4">
                            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Loading subjects...</div>
                    ) : Object.keys(grouped).length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">📚</div>
                            <p className="text-gray-500 font-medium">No subjects yet</p>
                            <p className="text-gray-400 text-sm mt-1">Click "Add Subject" or "Bulk Add" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(grouped).sort().map(className => (
                                <div key={className} className="bg-white rounded-xl shadow overflow-hidden">
                                    <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-700">{className}</h3>
                                        <span className="text-xs text-gray-400">{grouped[className].length} subjects</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {grouped[className].map(s => (
                                            <div key={s._id} className="px-5 py-3 flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        CA: {s.maxCA} · Exam: {s.maxExam} · Total: {s.maxCA + s.maxExam}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => setEditModal({ ...s })}
                                                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">Edit</button>
                                                    <button onClick={() => handleDelete(s._id, s.name)}
                                                        className="px-3 py-1 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {addModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Add Subject</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Subject Name</label>
                                <input value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                                    placeholder="e.g. English Language"
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Class</label>
                                <ClassDropdown value={newSubject.className}
                                    onChange={e => setNewSubject({ ...newSubject, className: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max CA Score</label>
                                    <input type="number" value={newSubject.maxCA}
                                        onChange={e => setNewSubject({ ...newSubject, maxCA: Number(e.target.value) })}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max Exam Score</label>
                                    <input type="number" value={newSubject.maxExam}
                                        onChange={e => setNewSubject({ ...newSubject, maxExam: Number(e.target.value) })}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                                Total = {newSubject.maxCA + newSubject.maxExam} marks (CA {newSubject.maxCA} + Exam {newSubject.maxExam})
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleAdd} disabled={adding}
                                className="flex-1 py-2.5 bg-blue-200 text-black rounded-xl border text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                {adding ? 'Adding...' : 'Add Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Edit Subject</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Subject Name</label>
                                <input value={editModal.name} onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
                                Class: <span className="font-medium text-gray-700">{editModal.className}</span> (cannot change)
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max CA</label>
                                    <input type="number" value={editModal.maxCA}
                                        onChange={e => setEditModal({ ...editModal, maxCA: Number(e.target.value) })}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max Exam</label>
                                    <input type="number" value={editModal.maxExam}
                                        onChange={e => setEditModal({ ...editModal, maxExam: Number(e.target.value) })}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                                Total = {editModal.maxCA + editModal.maxExam} marks
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleEdit} disabled={saving}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Add Modal */}
            {bulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">Bulk Add Subjects</h3>
                        <p className="text-xs text-gray-400 mb-4">Enter one subject per line. All go to the selected class.</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Class</label>
                                <ClassDropdown value={bulkClass} onChange={e => setBulkClass(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max CA (all)</label>
                                    <input type="number" value={bulkMaxCA} onChange={e => setBulkMaxCA(Number(e.target.value))}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Max Exam (all)</label>
                                    <input type="number" value={bulkMaxExam} onChange={e => setBulkMaxExam(Number(e.target.value))}
                                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Subjects (one per line)</label>
                                <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
                                    rows={8} placeholder={"English Language\nMathematics\nBasic Science\nSocial Studies"}
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => { setBulkModal(false); setBulkText('') }}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleBulkAdd} disabled={bulkAdding}
                                className="flex-1 py-2.5 bg-blue-200 text-black rounded-xl text-sm font-medium hover:bg-blue-100 disabled:opacity-50">
                                {bulkAdding ? 'Adding...' : `Add ${bulkText.split('\n').filter(s => s.trim()).length} Subjects`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}