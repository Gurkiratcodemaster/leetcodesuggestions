"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [solved, setSolved] = useState<SolvedProblem[]>([]);
  const [suggested, setSuggested] = useState<SuggestedProblem[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [replacing, setReplacing] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
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

        const suggestedRes = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SolvedProblems: recentSolved.map(
              (prob: SolvedProblem) => prob.title
            ),
          }),
        });

        const suggestedData = await suggestedRes.json();
        setSuggested(suggestedData.suggestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [username]);

  /* ---------------- REPLACE SELECTED ---------------- */
  const replaceSelectedProblems = async () => {
    if (selectedTitles.length === 0) return;

    setReplacing(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SolvedProblems: solved.map((p) => p.title),
          ExcludeProblems: selectedTitles,
        }),
      });

      const data = await res.json();

      // Remove selected problems
      const remaining = suggested.filter(
        (p) => !selectedTitles.includes(p.title)
      );

      setSuggested([...remaining, ...data.suggestions]);
      setSelectedTitles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setReplacing(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <p>User Not Found</p>;

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6">
      {/* PROFILE CARD */}
      <section className="bg-white rounded-xl shadow p-6 flex gap-6 items-center">
        <Image
          src={profile.avatar}
          alt="avatar"
          width={100}
          height={100}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="text-sm mt-1">🌍 Rank: {profile.ranking}</p>
          <p className="text-sm">⭐ Reputation: {profile.reputation}</p>
          <p className="text-sm">🏫 {profile.school}</p>
        </div>
      </section>

      {/* SOLVED */}
      <section className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-3">
          Recently Solved Problems
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          {solved.map((problem, idx) => (
            <li key={idx} className="text-gray-700">
              {problem.title}
            </li>
          ))}
        </ul>
      </section>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setShowSuggestions((prev) => !prev)}
        className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
      >
        {showSuggestions ? "Hide" : "Show"} AI Suggestions
      </button>

      {/* SUGGESTIONS */}
      <section
        className={`mt-6 transition-all duration-500 ${
          showSuggestions
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">
          AI-Suggested Problems
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {suggested.map((problem) => (
            <label
              key={problem.title}
              className={`border rounded-lg p-4 shadow-sm cursor-pointer transition
              ${
                selectedTitles.includes(problem.title)
                  ? "border-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedTitles.includes(problem.title)}
                onChange={() =>
                  setSelectedTitles((prev) =>
                    prev.includes(problem.title)
                      ? prev.filter((t) => t !== problem.title)
                      : [...prev, problem.title]
                  )
                }
              />
              <span className="font-semibold">{problem.title}</span>
              <p className="text-sm text-gray-600">
                Difficulty: {problem.difficulty}
              </p>
              <p className="text-sm text-gray-600">
                Concept: {problem.concept}
              </p>
            </label>
          ))}
        </div>

        {/* REPLACE BUTTON */}
        <button
          onClick={replaceSelectedProblems}
          disabled={replacing || selectedTitles.length === 0}
          className="mt-6 px-5 py-2 bg-green-600 disabled:bg-gray-400 text-white rounded transition"
        >
          {replacing ? "Replacing..." : "Replace Selected Problems"}
        </button>
      </section>
    </main>
  );
}
