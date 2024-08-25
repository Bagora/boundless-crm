'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error message
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 p-10 px-4 bg-slate-200 py-8">
      <div className="bg-white p-8 mt-8 rounded-3xl shadow-3xl py-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 drop-shadow-3xl">
      Boundless-CRM
      </h1>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-rose-800"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-rose-800"
            required
          />
          <button type="submit" className="text-2xl shadow-3xl rounded-3xl bg-gradient-to-r from-cyan-300 to-rose-600 text-black text-bold px-4 py-2 rounded hover:from-rose-400 hover:to-orange-300">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
