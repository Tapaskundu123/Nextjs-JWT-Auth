"use client";

import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface FormData {

  email: string;
  password: string;
}

export default function Login(){

  const router= useRouter();

  const [data, setData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/user/login", data);
      console.log("✅ Response:", response.data);

      router.push('/profile');
    }
     catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-4">
          Login
        </h1>

        <div>
          <label htmlFor="email" className="block font-semibold mb-1 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="Enter your email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-semibold mb-1 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            placeholder="Enter your password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Submit
        </button>

        <Link href='/User/signup' className="text-black">Signup here</Link>
      </form>
    </div>
  );
};
