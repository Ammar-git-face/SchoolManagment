"use client"
import Sidebar from "../sidebar"
import ChatPage from "../../chat"

const TeacherMessages = () => {
    return <ChatPage Sidebar={Sidebar} role="teacher" />
}

export default TeacherMessages