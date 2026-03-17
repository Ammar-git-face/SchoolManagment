'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { Users } from "lucide-react"
import Image from '@/node_modules/next/image';
import { API } from "../../config/api"

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();

  const handleLogin = async () => {

    const res = await fetch('${API}/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });


    const data = await res.json();
    if (data.user) {
      router.push('./home')
      console.log('user sign in')
    }
    console.log(Error);
    console.log(JSON.stringify(data));
    console.log("Sending to API:", JSON.stringify({ email, password }));
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Ping the protected route to verify JWT
        const res = await fetch('${API}/protected-route', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          // User is already logged in → redirect
          router.push('/component/home');
        }
        // else do nothing, let login form render
      } catch (err) {
        // If fetch fails, just stay on login
        console.log('Not logged in');
      }
    };

    checkLoggedIn();
  }, [router]);



  const [active, setActive] = useState("Parent");

  return (
    <div>



      {active === "Parent" && (
        <div className="p-4 flex justify-center items-center bg-gray-100 min-h-screen">
          <div className="w-1/3 p-4 bg-white shadow-2xl rounded-2xl h-160 text-center mb-19">
            <h1 className="font-bold text-2xl mb-6">Sign In</h1>
            <p className="text-gray-500 mb-6">Choose your role and sign in to continue</p>
            <div className='flex gap-12 justify-center items-center mb-4 bg-gray-200 rounded-xl h-12 text-gray-500 font-extralight focus focus:font-black focus:bg-white '>
              <button
                onClick={() => setActive("Parent")}
                className={active === "Parent" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Parent
              </button>
              <button
                onClick={() => setActive("Teachers")}
                className={active === "Teacers" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Teachers
              </button>
              <button
                onClick={() => setActive("Admin")}
                className={active === "Admin" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Admin
              </button>
            </div>

            {/* PARENT LOGIN */}
            <div className='bg-orange-100 rounded-2xl text-left pl-6 p-2 mb-10' >
              <h1 className='font-semibold text-gray-600 flex gap-2 items-center'> <Users size={25} className="text-orange-400" />Parent login</h1>
              <p className='text-md text-gray-600 ml-6'>view your child progress, pay fees and alot more</p>
            </div>
            <p className="text-left -mb-2 font-semibold">email</p><br></br>
            <input
              type="text"
              placeholder="Enter your name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 p-2 w-full rounded-xl mb-6 hover:border-blue-400"
            />
            <br />
            <p className="text-left mb-2 font-semibold">password</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2  p-2  w-full rounded-xl mb-14 hover:border-blue-400"
            />
            <br />
            <button
              onClick={handleLogin}
              className="bg-blue-500 p-2 border-blue-300 text-white w-5/5 h-10 rounded-3xl"
            >
              Sign In
            </button>
          </div>
        </div>
      )}



      {/* TEACHER LOGIN */}

      {active === "Teachers" && (
        <div className="p-4 flex justify-center items-center bg-gray-100 min-h-screen">
          <div className="w-1/3 p-4 bg-white shadow-2xl rounded-2xl h-160 text-center mb-19">
            <h1 className="font-bold text-2xl mb-6">Sign In</h1>
            <p className="text-gray-500 mb-6">Choose your role and sign in to continue</p>
            <div className='flex gap-12 justify-center items-center mb-4 bg-gray-200 rounded-xl h-12 text-gray-500 font-extralight focus focus:font-black focus:bg-white '>
              <button
                onClick={() => setActive("Parent")}
                className={active === "Parent" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Parent
              </button>
              <button
                onClick={() => setActive("Teachers")}
                className={active === "Teacers" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Teachers
              </button>
              <button
                onClick={() => setActive("Admin")}
                className={active === "Admin" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Admin
              </button>
            </div>

            {/* PARENT LOGIN */}
            <div className='bg-green-100 rounded-2xl text-left pl-6 p-2 mb-10' >
              <h1 className='font-semibold text-gray-600 flex gap-2 items-center'> <Users size={25} className="text-green-400" />Teachers login</h1>
              <p className='text-md text-gray-600 ml-6'>Access your classes and manage student results</p>
            </div>
            <p className="text-left -mb-2 font-semibold">email</p><br></br>
            <input
              type="text"
              placeholder="Enter your name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 p-2 w-full rounded-xl mb-6 hover:border-blue-400"
            />
            <br />
            <p className="text-left mb-2 font-semibold">password</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2  p-2  w-full rounded-xl mb-14 hover:border-blue-400"
            />
            <br />
            <button
              onClick={handleLogin}
              className="bg-blue-500 p-2 border-blue-300 text-white w-5/5 h-10 rounded-3xl"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      {/* ADMIN LOGIN */}

      {active === "Admin" && (
        <div className="p-4 flex justify-center items-center bg-gray-100 min-h-screen">
          <div className="w-1/3 p-4 bg-white shadow-2xl rounded-2xl h-160 text-center mb-19">
            <h1 className="font-bold text-2xl mb-6">Sign In</h1>
            <p className="text-gray-500 mb-6">Choose your role and sign in to continue</p>
            <div className='flex gap-12 justify-center items-center mb-4 bg-gray-200 rounded-xl h-12 text-gray-500 font-extralight focus focus:font-black focus:bg-white '>
              <button
                onClick={() => setActive("Parent")}
                className={active === "Parent" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Parent
              </button>
              <button
                onClick={() => setActive("Teachers")}
                className={active === "Teacers" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Teachers
              </button>
              <button
                onClick={() => setActive("Admin")}
                className={active === "Admin" ? "bg-white p-2 rounded-xl" : "p-2"}
              >
                Admin
              </button>
            </div>

            {/* PARENT LOGIN */}
            <div className='bg-blue-100 rounded-2xl text-left pl-6 p-2 mb-10' >
              <h1 className='font-semibold text-gray-600 flex gap-2 items-center'> <Users size={25} className="text-blue-400" />Admin login</h1>
              <p className='text-md text-gray-600 ml-6'>view your child progress, pay fees and alot more</p>
            </div>
            <p className="text-left -mb-2 font-semibold">email</p><br></br>
            <input
              type="text"
              placeholder="Enter your name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 p-2 w-full rounded-xl mb-6 hover:border-blue-400"
            />
            <br />
            <p className="text-left mb-2 font-semibold">password</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2  p-2  w-full rounded-xl mb-14 hover:border-blue-400"
            />
            <br />
            <button
              onClick={handleLogin}
              className="bg-blue-500 p-2 border-blue-300 text-white w-5/5 h-10 rounded-3xl"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
