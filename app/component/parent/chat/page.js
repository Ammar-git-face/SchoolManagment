"use client"
import Sidebar from "../sidebar"
import ChatPage from "../../chat"

const ParentMessages = () => {
    return <ChatPage Sidebar={Sidebar} role="parent" />
}

export default ParentMessages