"use client";
import { Book, User2, GraduationCap, DollarSignIcon } from "lucide-react";
import { Pie, PieChart, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const hero = () => {

    const data = [
        { name: "paid", value: 60, id: 1 },
        { name: "pending", value: 30, id: 1 },
        { name: "overdue", value: 10, id: 1 }
    ];
    const sections = [
        { name: "Nur Section", value: 30, id: 1 },
        { name: "Pri Section", value: 70, id: 2 },
        { name: "sec Section", value: 50, id: 3 },
        { name: "Teachers performance", value: 120, id: 4 },
        { name: "Parent performance", value: 80, id: 5 }

    ]
    const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];

    const first = [
        { title: "Total student", heading: 5, content: "12 % vs last month", icon: <GraduationCap size={35} className=" p-1.5 text-blue-500 font-light bg-blue-200 rounded-xl " />, id: 1 },
        { title: "Total Teaches", heading: 4, icon: <User2 size={34} className="p-1.5 text-green-500 font-light bg-green-200 rounded-xl" />, id: 2 },
        { title: "Total classes", heading: 3, icon: <Book size={34} className="p-1.5 text-yellow-500 font-light bg-yellow-200 rounded-xl" />, id: 3 },
        { title: "Fee collected", heading: "$ 12.0980", content: " $ 10.1000 pending", icon: <DollarSignIcon size={35} className="p-1.5 text-gray-500 font-light bg-gray-200 rounded-xl" />, id: 4 }
    ];

    return (
        <div className="">
            <div className="fixed mt-1 w-5/6  font-sans mx-65 h-22  border-gray-300 px-4 py-3 items-center bg-gray-200">
                <h1 className="text-black font-semibold">WELCOME BACK Mr, Ammar</h1>
                <p className="text-sm text-gray-400">Here is what is going on in your school</p>
            </div>
            {/* hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-72 p-6 gap-55">
                {first.map((list) => (
                    <div key={list.id} className="p-3.5 mt-30 shadow-md w-52 rounded-md h-30 space-x-2 bg-gray-100 ">
                        <p className="flex items-center gap-15 text-xs text-gray-500 mb-1">{list.title} <span>{list.icon}</span></p>
                        <h1 className="text-xl font-bold font-sans mb-1">{list.heading}</h1>
                        <p className="text-sm text-gray-400 " >{list.content}</p>
                    </div>
                ))
                }
            </div>

            <div className="">

                {/*pie Chart */}

                <div className="flex gap-15 mb-8 mx-80">
                <section className="shadow-md ">
                    <div className="p-4 rounded-md col-span-2">
                        <p className="text-xs text-gray-500 mb-2">Classes Distrubution</p>

                        <div className="h-69 w-98">
                            <ResponsiveContainer width="90%" height="90%">
                                <BarChart data={sections}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </section>
                {/*bar Chart */}

                <section className="shadow-md">
                    <PieChart width={405} height={405}>
                        <Pie
                            data={data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            isAnimationActive
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <nav className="flex items-center gap-15 mx-10 mb-5">
                        <div className="flex items-center gap-1"> <i className="bg-blue-500 w-3 h-3 rounded-xl"></i><ul className="text-sm" >paid:60</ul></div>
                        <div className="flex items-center gap-1"> <i className="bg-green-500 w-3 h-3 rounded-xl"></i><ul className="text-sm">pending:30</ul></div>
                        <div className="flex items-center gap-1"> <i className="bg-yellow-500 w-3 h-3 rounded-xl"></i><ul className="text-sm">Overdue:10</ul></div>
                    </nav>
                </section>
                </div>

                <div className="flex items-center  gap-20 ">

                    {/* recent payment */}

                    
        



                    {/* Quick stats */}
                     
                </div>

            </div >

        </div >
    );
}

export default hero;