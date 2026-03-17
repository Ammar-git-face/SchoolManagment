'use client';

import { useState } from 'react';
import { API } from "../../config/api"

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTest = async () => {
    const res = await fetch('${API}/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await res.json();
    console.log('Response:', data);
    alert(JSON.stringify(data));
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleTest}>Test API</button>
    </div>
  );
}