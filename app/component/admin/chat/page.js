"use client"
import Sidebar from "../sidevar";
import ChatPage from "../../chat"
const AdminMessages = () => {
    return <ChatPage Sidebar={Sidebar} role="admin" />
}

export default AdminMessages