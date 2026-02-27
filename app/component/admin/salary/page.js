"use client"
import { DollarSign, Wallet2, Search, Users, Download, Wallet } from "lucide-react";
import Sidebar from "../sidevar"
import {useState , useEffect} from "react"


const salary = () => {
    const fees = [
        { Total: "Total Montly expense ", amount: '$1000', icon: <Wallet2 size={40} className=" shadow-md p-2 rounded-md text-green-400 bg-green-100 " />, id: 1 },
        { Total: "Paid This Month", amount: '10', name: "Teachers", icon: <Users size={40} className=" shadow-md p-2 rounded-md text-blue-400 bg-blue-100 " />, id: 2 },
        { Total: "Pending Payment", amount: '0', name: "Teachers", icon: <DollarSign size={40} className=" shadow-md p-2 rounded-md text-red-400 bg-red-100 " />, id: 3 }
    ]
    const colors = ['bg-green-100', 'bg-blue-100', 'bg-red-100']

    const [teacher,setTeacher] = useState([]);


    const getData = async (req, res) => {
        try {
            const res = await fetch('http://localhost:5000/teacher/getTeachers')
            const result = await res.json()
            setTeacher(result)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div>
            <Sidebar />

            <div className="ml-0 md:ml-80 mt-10 md:mt-20 flex flex-col sm:flex-row items-center gap-4 md:gap-8 mb-10 px-4">
                {
                    fees.map((list, index) => (
                        <nav key={list.id} className={`shadow-xl w-full sm:w-68 h-25 p-2 rounded-xl hover:shadow-2xl ${index === 0 ? 'bg-green-50' : index === 1 ? 'bg-blue-50' : 'bg-red-50'}`} >
                            <p className="text-gray-400 text-xs mb-2">{list.Total}</p>
                            <nav className="flex  gap-33 items-center text-black text-2xl font-semibold"><h1 className="p-2">{list.amount}</h1> {list.icon}</nav>
                            <p className="mb-2 text-xs text-gray-400 pl-3">{list.name}</p>
                        </nav>
                    ))
                }
            </div>

            <div className="px-4 md:ml-80 overflow-x-auto">
                <table className="w-full min-w-[500px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-6 py-3 text-left text-xs  text-gray-600">
                                Teacher
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                monthly salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                This Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {teacher.map((student) => (
                            <tr
                                key={student._id}
                                className="border-t text-xs border-gray-200 hover:bg-gray-50"
                            >
                                <td className="px-5 py-3 flex items-center">
                                    <span className="text-xs">{student.fullname} <p className="text-gray-500 text-xs ">  {student.email}</p></span>
                                </td>
                                <td className="px-10">
                                {student.salary}
                                </td>
                                <td>
                                    <span className="bg-green-100 text-green-500 p-1 cursor-pointer hover:bg-blue-100 transition-all text-xs px-8 ml-5 rounded-xl">{student.paid}</span>
                                </td>
                                <td>
                                    <span className=" text-gray-500 text-xs font-extralight rounded-xl px-5">{student.sunject}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default salary;