"use client";

// import { PieChart, Pie } from "recharts";

// const data = [
//   { name: "A", value: 400 },
//   { name: "B", value: 300 }
// ];

// export default function TestChart() {
//   return (
//     <PieChart width={300} height={300}>
//       <Pie data={data} dataKey="value" isAnimationActive />
//     </PieChart>
//   );
// }


// barchart
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer
// } from "recharts";

// const data = [
//   { name: "Math", value: 400 },
//   { name: "Physics", value: 300 },
//   { name: "Chemistry", value: 200 },
//   { name: "Biology", value: 500 }
// ];

// export default function SimpleBarChart() {
//   return (
//     <div className="w-full h-72">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data}>
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="value" radius={[6, 6, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// piechart

"use client";

import { PieChart, Pie, Tooltip , Cell } from "recharts";

const data = [
  { name: "Math", value: 400 },
  { name: "Physics", value: 300 },
  { name: "Chemistry", value: 300 },
  { name: "Biology", value: 200 }
];

const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];

export default function DonutChart() {
  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        innerRadius={70}
        outerRadius={100}
        paddingAngle={3}
        isAnimationActive
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
