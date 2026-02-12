'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logout from "../admin/logout"

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/protected-route', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
          setLoading(false);
          router.push('/component/home');
        } else if (res.status === 401) {
          router.push('/login'); // redirect unauthorized users
        } else {
          const text = await res.text();
          console.error('Server error:', text);
        }
      } catch (error) {
        console.error('Fetch failed:', error);
        router.push('/component/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return <p>Loading and checking permissions...</p>;

  return (
    <div>
      <Logout />
      <h1>Welcome to the Protected Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
