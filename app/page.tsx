"use client";

import { useState } from "react";

const HOW_MET_OPTIONS = [
  "a dating app",
  "in real life",
  "through mutual friends",
  "at work",
  "other",
];

function SliderInput({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-6">
      <label className="block font-bold text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-28 text-right shrink-0">{leftLabel}</span>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-pink-500"
        />
        <span className="text-xs text-gray-500 w-28 shrink-0">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [numDates, setNumDates] = useState(2);
  const [howMet, setHowMet] = useState(HOW_MET_OPTIONS[0]);
  const [sincerity, setSincerity] = useState(5);
  const [doorOpen, setDoorOpen] = useState(4);
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [excuseTheme, setExcuseTheme] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numDates, howMet, sincerity, doorOpen, length, excuseTheme }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }

      setOutput(data.text);
      setHasGenerated(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-yellow-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-pink-600 tracking-tight">
            The Fizzler
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic">
            Let them down easy. Mostly.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6">
          {/* Number of dates */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-1">
              How many dates have you been on?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                value={numDates}
                onChange={(e) => setNumDates(Number(e.target.value))}
                className="flex-1 accent-pink-500"
              />
              <span className="font-black text-pink-600 text-xl w-8 text-center">
                {numDates === 10 ? "10+" : numDates}
              </span>
            </div>
          </div>

          {/* How you met */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-1">
              How did you meet?
            </label>
            <select
              value={howMet}
              onChange={(e) => setHowMet(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            >
              {HOW_MET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sincerity */}
          <SliderInput
            label="How sincere should this be?"
            leftLabel="Just being polite"
            rightLabel="Genuinely means it"
            value={sincerity}
            onChange={setSincerity}
          />

          {/* Door open */}
          <SliderInput
            label="Keep the door open?"
            leftLabel="Door is SHUT"
            rightLabel="Maybe someday..."
            value={doorOpen}
            onChange={setDoorOpen}
          />

          {/* Length */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-2">
              Message length
            </label>
            <div className="flex gap-3">
              {(["short", "medium", "long"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 py-2 rounded-xl font-bold capitalize border-2 transition-colors ${
                    length === l
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Excuse theme */}
          <div className="mb-2">
            <label className="block font-bold text-gray-700 mb-1">
              Excuse theme{" "}
              <span className="font-normal text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="text"
              placeholder='e.g. "too busy with work", "moving cities", "focusing on myself"'
              value={excuseTheme}
              onChange={(e) => setExcuseTheme(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-black text-xl rounded-2xl transition-colors shadow-md mb-6"
        >
          {loading
            ? "Fizzling..."
            : hasGenerated
            ? "Regenerate"
            : "Fizzle 'Em"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>
        )}

        {/* Output */}
        {output && (
          <div className="bg-white rounded-3xl shadow-md p-8">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {output}
            </p>
            <button
              onClick={copyToClipboard}
              className="mt-6 w-full py-3 border-2 border-pink-300 text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-colors"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
