"use client";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!username.trim())  return;
    router.push(`/user/${username}`);
  }
  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[90vh]">
        <form onSubmit={handleSearch}>
          <input type="search" placeholder="Enter your Leetcode username" className="border border-gray-400 px-2 py-1 text-black w-[60vw]" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button type="submit" className="bg-yellow-400 px-2 py-1  border border-gray-400">Search
          </button>
        </form>
      </div>
    </main>
  );
}