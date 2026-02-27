"use client"
import Sidebar from "../sidevar";
import { User2, Search, Printer } from "lucide-react"
import { useState, useEffect } from "react";

const Result = () => {
  const [session, setSession] = useState("")
  const [term, setTerm] = useState("")
  const [table, setTable] = useState(true)
  const [data, setData] = useState([])

  const ResultData = [
    { subjects: "Mathematics", test: 16, note: 17, assign: 8, exams: 44, total: 85, grade: "A", id: 1 },
    { subjects: "English", test: 14, note: 15, assign: 7, exams: 42, total: 78, grade: "B", id: 2 },
    { subjects: "Science", test: 18, note: 18, assign: 9, exams: 47, total: 92, grade: "A+", id: 3 }
  ]

  const getData = async () => {
    const res = await fetch('http://127.0.0.1:5000/student/getStudent')
    const data = await res.json()
    setData(data)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (must be fixed internally) */}
      <Sidebar />

      {/* Main Content */}
      <main className="pt-6 px-4 sm:px-6 lg:px-1 lg:ml-65">
        <h1 className="font-bold text-black text-xl mb-1">
          Results Overview
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          View, approve and print student result sheets
        </p>

        {/* Content Wrapper */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Student List */}
          <div className=" lg:w-80  bg-gray-100 rounded-xl p-3 shadow-lg">
            <span className="flex items-center gap-1 text-sm font-semibold mb-2">
              <User2 size={16} className="text-blue-700" /> Select Student
            </span>

            <div className="relative mb-2">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-8 pr-4 py-2 h-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="h-60 overflow-y-auto mb-3 w-60 ">
              {data.map(s => (
                <div
                  key={s._id}
                  className="p-3 mb-1 bg-white rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  <h1 className="font-medium text-black">{s.fullname}</h1>
                  <p className="text-gray-500 text-sm">{s.studentClass}</p>
                </div>
              ))}
            </div>

            <label className="text-sm font-medium">Term</label>
            <select
              className="w-full mb-3 mt-1 rounded-md bg-white border border-gray-200 h-9 text-sm px-2"
              onChange={(e) => setTerm(e.target.value)}
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>

            <label className="text-sm font-medium">Session</label>
            <input
              type="text"
              placeholder="e.g. 2024/2025"
              onChange={(e) => setSession(e.target.value)}
              className="w-full mt-1 rounded-md bg-white border border-gray-200 h-9 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Results Section */}
          {table && (
            <div className="flex-1 flex flex-col gap-4">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-xs">Subjects</p>
                  <p className="font-bold text-md">{data.length}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Average</p>
                  <p className="font-bold text-md">85/100</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Overall Grade</p>
                  <p className="font-bold text-md text-green-600">A</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
                <table className="w-80 min-w-[650px] text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="py-2 text-left">Subject</th>
                      <th className="py-2 text-center">Test/20</th>
                      <th className="py-2 text-center">Note/20</th>
                      <th className="py-2 text-center">Assign/10</th>
                      <th className="py-2 text-center">Exam/50</th>
                      <th className="py-2 text-center">Total</th>
                      <th className="py-2 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ResultData.map(r => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2">{r.subjects}</td>
                        <td className="py-2 text-center">{r.test}</td>
                        <td className="py-2 text-center">{r.note}</td>
                        <td className="py-2 text-center">{r.assign}</td>
                        <td className="py-2 text-center">{r.exams}</td>
                        <td className="py-2 text-center font-bold">{r.total}</td>
                        <td className="py-2 text-center font-semibold text-green-600">{r.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-medium">Class Teacher's Remark</label>
                    <textarea
                      rows={3}
                      className="w-full mt-1 rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Principal's Remark</label>
                    <textarea
                      rows={3}
                      className="w-full mt-1 rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Print */}
                <button className="mt-4 w-full bg-blue-600 text-white flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-blue-700">
                  <Printer size={16} /> Print Result Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Result