"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface LeetCodeProfile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
  reputation: number;
  country: string;
  school: string;
}

interface SuggestedProblem {
  title: string;
  difficulty: string;
  concept: string;
}

interface SolvedProblem {
  title: string;
  lang: string;
  statusDisplay: string;
}

export default function UserPage({ username }: { username: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const handleChangeUser = (e: React.FormEvent) => {
  e.preventDefault();
  if (!newUsername.trim()) return;

  setShowModal(false);
  router.push(`/user/${newUsername}`);
  };
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [solved, setSolved] = useState<SolvedProblem[]>([]);
  const [suggested, setSuggested] = useState<SuggestedProblem[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);



  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const profileRes = await fetch(
          `https://alfa-leetcode-api.onrender.com/${username}`
        );
        const profileData = await profileRes.json();
        setProfile(profileData);

        const solvedRes = await fetch(
          `https://alfa-leetcode-api.onrender.com/${username}/acsubmission`
        );
        const solvedData = await solvedRes.json();
        const recentSolved = solvedData.submission.slice(0, 10);
        setSolved(recentSolved);
        setExcluded([]); // reset when new user loads
        fetchSuggestions(recentSolved, []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [username]);

  const fetchSuggestions = async (solvedProblems: SolvedProblem[], excludedProblems: string[]) => {
    try{
      setSuggestionsLoading(true);
      const res = await fetch("/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SolvedProblems: solvedProblems.map((p) => p.title),
          ExcludedProblems: excludedProblems,
        }),
      });
  
      const data = await res.json();
      setSuggested(data.suggestions);
      const newTitles = data.suggestions.map((s: any) => s.title);
      setExcluded((prev) => [...prev, ...newTitles]);
    }catch(error){
      console.error("Error fetching suggestions:", error);
    }finally{
      setSuggestionsLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <p>User Not Found</p>;

 return (
  
<main className="min-h-screen bg-gray-300 text-black px-4 py-6 md:px-12">


    {/* PROFILE CARD */}
<section className="relative mx-auto max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40
 p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:shadow-lg">

  {/* CHANGE USER BUTTON */}
  <button
    onClick={() => setShowModal(true)}
    className="absolute top-4 right-4 px-4 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
  >
    Change User
  </button>

  <Image
    src={profile.avatar}
    alt="avatar"
    width={120}
    height={120}
    className="rounded-full border border-gray-300"
  />

  <div className="text-center sm:text-left space-y-1">
    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
      {profile.name}
    </h1>

    <p className="text-gray-500">@{profile.username}</p>

    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-700">

      <span>🌍 Rank: {profile.ranking}</span>
      <span>⭐ {profile.reputation}</span>

      {profile.school && <span>🏫 {profile.school}</span>}

    </div>
  </div>

</section>


    {/* SOLVED */}
    <section className="mx-auto max-w-4xl mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

      <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
        Recently Solved
      </h2>

      <ul className="space-y-2">

        {solved.map((p) => (
          <li
            key={p.title}
            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
          >
            {p.title}
          </li>
        ))}

      </ul>
    </section>

    {/* BUTTON */}
    <div className="mt-8 flex justify-center gap-4">

  <button
    onClick={() => setShowSuggestions((p) => !p)}
    className="px-6 py-2 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-500 transition"
  >
    {showSuggestions ? "Hide" : "Show"} Suggestions
  </button>

</div>

    {showSuggestions && suggested.length > 0 && (
  <div className="mt-4 flex justify-center">

    <button
      onClick={() => fetchSuggestions(solved, excluded)}
      disabled={suggestionsLoading}
      className={`px-5 py-2 rounded-full border text-sm transition
        ${
          suggestionsLoading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-white hover:bg-gray-100"
        }`}
    >
      {suggestionsLoading ? "Loading..." : " Replace Suggestions"}
    </button>

  </div>
)}


    {/* SUGGESTIONS */}
    <section
      className={`mx-auto max-w-4xl mt-8 transition-all duration-500 ease-out ${
        showSuggestions
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >

      <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-2">

        Recommended Problems

      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {suggested.map((p) => (
          <div
            key={p.title}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >

            <h3 className="font-semibold text-base mb-2">
              {p.title}
            </h3>

            <div className="text-sm text-gray-600 space-y-1">

              <p>
                <span className="font-medium text-gray-800">
                  Difficulty:
                </span>{" "}
                {p.difficulty}
              </p>

              <p>
                <span className="font-medium text-gray-800">
                  Concept:
                </span>{" "}
                {p.concept}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
    {/* CHANGE USER MODAL */}
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

    <div className="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-xl animate-fadeIn">

      <h3 className="text-lg font-semibold mb-4 text-center">
        Change LeetCode User
      </h3>

      <input
        type="text"
        placeholder="Enter username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      <div className="mt-5 flex justify-end gap-3">

        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleChangeUser}
          className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 transition font-medium"
        >
          Search
        </button>

      </div>

    </div>

  </div>
)}


  </main>
);
}