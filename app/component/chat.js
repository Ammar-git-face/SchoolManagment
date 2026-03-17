"use client"
import { Send, Search, Circle } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import { API } from "../config/api"

const SOCKET_URL = `${API}`

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

const roleColor = (role) => {
    if (role === "admin") return "bg-blue-100 text-blue-500"
    if (role === "teacher") return "bg-green-100 text-green-500"
    return "bg-orange-100 text-orange-500"
}

const Chat = ({ Sidebar }) => {
    const [user, setUser] = useState(null)
    const [contacts, setContacts] = useState([])
    const [activeContact, setActiveContact] = useState(null)
    const [messages, setMessages] = useState([])
    const [text, setText] = useState("")
    const [onlineUsers, setOnlineUsers] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const activeContactRef = useRef(null)

    // keep ref in sync so socket callbacks can read current activeContact
    // also persist to localStorage so messages reload after refresh
    useEffect(() => {
        activeContactRef.current = activeContact
        if (activeContact) {
            localStorage.setItem("lastActiveContact", JSON.stringify(activeContact))
        }
    }, [activeContact])

    // scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchContacts = useCallback(async (userId) => {
        try {
            const res = await fetch(`${SOCKET_URL}/messages/contacts/${userId}`)
            const data = await res.json()
            // FIX: guard against non-array response
            setContacts(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("fetchContacts error:", err)
        }
    }, [])

    // init socket + user — runs once on mount
    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (!stored) return

        // FIX: safe JSON parse
        let parsed
        try {
            parsed = JSON.parse(stored)
        } catch {
            console.error("Invalid user in localStorage")
            return
        }

        setUser(parsed)

        // FIX: declare mounted guard BEFORE socket and all callbacks
        let mounted = true

        // FIX: use websocket transport only — polling requires CORS preflight
        // which fails when credentials:true + wildcard origin on some servers
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000
        })
        socketRef.current = socket

        socket.on("connect", () => {
            socket.emit("register", parsed.id)
        })

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message)
        })

        socket.on("online_users", (users) => {
            // FIX: normalise all IDs to strings — ObjectId vs string mismatch
            // was causing onlineUsers.includes(String(contact._id)) to always return false
            setOnlineUsers(Array.isArray(users) ? users.map(String) : [])
        })

        socket.on("receiveMessage", (message) => {
            const current = activeContactRef.current

            // FIX: compare as strings to avoid ObjectId type mismatch
            const fromCurrentContact = current &&
                String(message.senderId) === String(current._id)

            // FIX: only append to messages if from the open conversation
            // prevents messages from other chats leaking into the active window
            if (fromCurrentContact) {
                setMessages((prev) => {
                    if (prev.find((m) => String(m._id) === String(message._id))) return prev
                    return [...prev, message]
                })
            }

            // always update contact list preview + unread badge
            setContacts((prev) =>
                prev.map((c) =>
                    String(c._id) === String(message.senderId)
                        ? {
                              ...c,
                              lastMessage: message.message,
                              lastMessageTime: message.createdAt,
                              unreadCount: fromCurrentContact
                                  ? 0
                                  : (c.unreadCount || 0) + 1,
                          }
                        : c
                )
            )
        })

        // FIX: messageSent ONLY here, never inside sendMessage
        socket.on("messageSent", (message) => {
            setMessages((prev) => {
                if (prev.find((m) => m._id === message._id)) return prev
                // replace the optimistic entry — temp ids are numeric Date.now strings (≤15 chars)
                const filtered = prev.filter(
                    (m) =>
                        !(
                            m.senderId === message.senderId &&
                            m.message === message.message &&
                            String(m._id).length <= 15
                        )
                )
                return [...filtered, message]
            })
            setContacts((prev) =>
                prev.map((c) =>
                    c._id === message.receiverId
                        ? { ...c, lastMessage: message.message, lastMessageTime: message.createdAt }
                        : c
                )
            )
        })

        socket.on("messages_read", () => {
            setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
        })

        socket.on("messageError", (errMsg) => {
            console.error("Message send error:", errMsg)
        })

        if (mounted) fetchContacts(parsed.id)

        // FIX: restore last active contact from localStorage on mount
        // so messages are visible again after a page refresh
        const lastContact = localStorage.getItem("lastActiveContact")
        if (lastContact && mounted) {
            try {
                const contact = JSON.parse(lastContact)
                setActiveContact(contact)
                // reload messages for this contact
                authFetch(`${SOCKET_URL}/messages/${parsed.id}/${contact._id}`)
                    .then(r => r.json())
                    .then(data => { if (mounted) setMessages(Array.isArray(data) ? data : []) })
                    .catch(console.error)
            } catch { /* ignore */ }
        }

        return () => {
            mounted = false
            socket.disconnect()
            socketRef.current = null
        }
    }, [fetchContacts])

    const openChat = async (contact) => {
        setActiveContact(contact)
        setMessages([])
        setLoading(true)
        try {
            const stored = JSON.parse(localStorage.getItem("user"))
            const res = await fetch(`${SOCKET_URL}/messages/${stored.id}/${contact._id}`)
            const data = await res.json()
            setMessages(Array.isArray(data) ? data : [])

            socketRef.current?.emit("mark_read", { userId: stored.id, otherId: contact._id })
            await fetch(`${SOCKET_URL}/messages/read/${stored.id}/${contact._id}`, { method: "PUT" })

            setContacts((prev) =>
                prev.map((c) => (c._id === contact._id ? { ...c, unreadCount: 0 } : c))
            )
        } catch (err) {
            console.error("openChat error:", err)
        }
        setLoading(false)
    }

    const sendMessage = () => {
        if (!text.trim() || !activeContact || !user) return
        // FIX: guard against undefined / disconnected socket
        if (!socketRef.current?.connected) {
            console.error("Socket not connected")
            return
        }

        const messageData = {
            senderId: user.id,
            senderName: user.name,
            senderRole: user.role,
            receiverId: activeContact._id,
            receiverName: activeContact.name,
            receiverRole: activeContact.role,
            message: text.trim(),
        }

        socketRef.current.emit("sendMessage", messageData)

        // optimistic update — replaced when messageSent confirms from server
        setMessages((prev) => [
            ...prev,
            {
                ...messageData,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                read: false,
            },
        ])

        setContacts((prev) =>
            prev.map((c) =>
                c._id === activeContact._id
                    ? { ...c, lastMessage: text.trim(), lastMessageTime: new Date().toISOString() }
                    : c
            )
        )

        // FIX: setText only once
        setText("")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const filteredContacts = contacts.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    )

    const totalUnread = contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)

    const formatTime = (date) => {
        if (!date) return ""
        return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }

    const formatDate = (date) => {
        if (!date) return ""
        const d = new Date(date)
        const today = new Date()
        if (d.toDateString() === today.toDateString()) return "Today"
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt)
        if (!groups[date]) groups[date] = []
        groups[date].push(message)
        return groups
    }, {})

    return (
        <div>
            <Sidebar />
            <div className="md:ml-64 h-screen flex flex-col">
                <div className="flex h-full overflow-hidden">

                    {/* Left Panel - Contacts */}
                    <div className="w-80 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-gray-800">Messages</h2>
                                {totalUnread > 0 && (
                                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {totalUnread}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-8">No contacts found</p>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <button
                                        key={contact._id}
                                        onClick={() => openChat(contact)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all border-b border-gray-50
                                            ${activeContact?._id === contact._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${roleColor(contact.role)}`}>
                                                {getInitials(contact.name)}
                                            </div>
                                            {onlineUsers.includes(String(contact._id)) && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-gray-700 truncate">{contact.name}</p>
                                                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                    {contact.lastMessageTime ? formatDate(contact.lastMessageTime) : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-xs text-gray-400 truncate">
                                                    {contact.lastMessage || <span className="italic">No messages yet</span>}
                                                </p>
                                                {contact.unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
                                                        {contact.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs capitalize px-1.5 py-0.5 rounded-full ${roleColor(contact.role)}`}>
                                                {contact.role}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Chat Window */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {!activeContact ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Send size={28} className="text-blue-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">Select a conversation</p>
                                <p className="text-xs text-gray-400 mt-1">Choose a contact to start messaging</p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${roleColor(activeContact.role)}`}>
                                            {getInitials(activeContact.name)}
                                        </div>
                                        {onlineUsers.includes(String(activeContact._id)) && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{activeContact.name}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            {onlineUsers.includes(String(activeContact._id)) ? (
                                                <><Circle size={8} className="text-green-400 fill-green-400" /> Online</>
                                            ) : (
                                                <><Circle size={8} className="text-gray-300 fill-gray-300" /> Offline</>
                                            )}
                                            <span className="capitalize ml-1">· {activeContact.role}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
                                    {loading ? (
                                        <p className="text-xs text-gray-400 text-center py-8">Loading messages...</p>
                                    ) : Object.keys(groupedMessages).length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-8">No messages yet. Say hello! 👋</p>
                                    ) : (
                                        Object.entries(groupedMessages).map(([date, msgs]) => (
                                            <div key={date}>
                                                <div className="flex items-center gap-3 my-4">
                                                    <div className="flex-1 h-px bg-gray-200" />
                                                    <span className="text-xs text-gray-400 px-2">{date}</span>
                                                    <div className="flex-1 h-px bg-gray-200" />
                                                </div>
                                                {msgs.map((message) => {
                                                    // FIX: compare as strings — MongoDB _id vs localStorage id may differ in type
                                                    const isMine = String(message.senderId) === String(user?.id)
                                                    // FIX: use senderRole from the message itself, not activeContact.role
                                                    // this ensures correct color regardless of who sent it (parent, teacher, admin)
                                                    const senderRole = isMine ? user?.role : (message.senderRole || activeContact.role)
                                                    const senderName = isMine ? user?.name : (message.senderName || activeContact.name)
                                                    return (
                                                        <div key={message._id} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
                                                            {!isMine && (
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 self-end ${roleColor(senderRole)}`}>
                                                                    {getInitials(senderName)}
                                                                </div>
                                                            )}
                                                            <div className="max-w-xs lg:max-w-md">
                                                                <div className={`px-4 py-2.5 rounded-2xl text-sm
                                                                    ${isMine
                                                                        ? "bg-blue-500 text-white rounded-br-sm"
                                                                        : "bg-white text-gray-700 shadow-sm rounded-bl-sm border border-gray-100"}`}>
                                                                    {message.message}
                                                                </div>
                                                                <p className={`text-xs text-gray-400 mt-1 ${isMine ? "text-right" : "text-left"}`}>
                                                                    {formatTime(message.createdAt)}
                                                                    {isMine && (
                                                                        <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="bg-white border-t border-gray-100 px-5 py-3">
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
                                        <input
                                            type="text"
                                            placeholder={`Message ${activeContact.name}...`}
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!text.trim()}
                                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white p-2 rounded-xl transition-all"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 text-center">Press Enter to send</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat