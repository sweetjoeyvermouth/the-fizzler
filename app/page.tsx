"use client";

import { useState, useRef } from "react";

const HOW_MET_OPTIONS = [
  "a dating app",
  "in real life",
  "through mutual friends",
  "at work",
  "other",
];

const EXCUSE_OPTIONS = [
  { value: "", label: "No specific excuse" },
  { value: "recently out of a serious relationship", label: "Recently out of a serious relationship" },
  { value: "too busy with work right now", label: "Too busy with work" },
  { value: "focusing on personal growth", label: "Focusing on personal growth" },
  { value: "not in the right headspace to date", label: "Not in the right headspace" },
  { value: "moving to a new city soon", label: "Moving cities soon" },
  { value: "reconnecting with an ex", label: "Reconnecting with an ex" },
  { value: "dealing with family stuff", label: "Dealing with family stuff" },
  { value: "just not feeling a romantic connection", label: "Not feeling a romantic connection" },
  { value: "custom", label: "Write my own..." },
];

const INTIMACY_LABELS = [
  "Just vibing",
  "First base",
  "Second base",
  "Third base",
  "Home run",
];

function SliderInput({
  label,
  leftLabel,
  rightLabel,
  value,
  min = 1,
  max = 10,
  onChange,
  displayValue,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-1">
        <label className="font-bold text-gray-700">{label}</label>
        {displayValue && (
          <span className="text-sm font-semibold text-pink-500">{displayValue}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 w-24 text-right shrink-0">{leftLabel}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-pink-500"
        />
        <span className="text-xs text-gray-400 w-24 shrink-0">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const [numDates, setNumDates] = useState(2);
  const [howMet, setHowMet] = useState(HOW_MET_OPTIONS[0]);
  const [sincerity, setSincerity] = useState(3);
  const [doorOpen, setDoorOpen] = useState(4);
  const [length, setLength] = useState(5);
  const [excuseOption, setExcuseOption] = useState("");
  const [customExcuse, setCustomExcuse] = useState("");
  const [grammarLevel, setGrammarLevel] = useState(5);
  const [intimacy, setIntimacy] = useState(1);
  const [theirVibe, setTheirVibe] = useState("");
  const [timeSinceContact, setTimeSinceContact] = useState("");
  const [theirMessage, setTheirMessage] = useState("");
  const [showTheirMessage, setShowTheirMessage] = useState(false);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const excuseTheme = excuseOption === "custom" ? customExcuse : excuseOption;

  async function generate() {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          numDates,
          howMet,
          sincerity,
          doorOpen,
          length,
          excuseTheme,
          grammarLevel,
          intimacy,
          theirVibe,
          timeSinceContact,
          theirMessage,
        }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }

      setOutput(data.text);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Network error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const grammarLabel =
    grammarLevel <= 3 ? "text speak" :
    grammarLevel <= 6 ? "casual" :
    grammarLevel <= 8 ? "proper" :
    "perfect grammar";

  const lengthLabel =
    length <= 2 ? "very short" :
    length <= 4 ? "short" :
    length <= 6 ? "medium" :
    length <= 8 ? "long" :
    "very long";

  return (
    <main className="min-h-screen bg-yellow-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-pink-600 tracking-tight">
            The Fizzler
          </h1>
          <p className="text-gray-500 mt-2 text-lg italic">
            Let them down easy.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6">

          {/* Name */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-1">
              Their name{" "}
              <span className="font-normal text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Number of dates */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <label className="font-bold text-gray-700">How many dates?</label>
              <span className="text-sm font-semibold text-pink-500">
                {numDates === 10 ? "10+" : numDates}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={numDates}
              onChange={(e) => setNumDates(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
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

          {/* Their vibe */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-1">
              What&apos;s their vibe?{" "}
              <span className="font-normal text-gray-400 text-sm">(optional)</span>
            </label>
            <select
              value={theirVibe}
              onChange={(e) => setTheirVibe(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            >
              <option value="">Not sure / doesn&apos;t matter</option>
              <option value="really-into-me">Really into me</option>
              <option value="intense">A bit intense / moving fast</option>
              <option value="casual">Pretty casual about it</option>
              <option value="sweet-no-spark">Super sweet, just no spark</option>
              <option value="hard-to-read">Hard to read</option>
            </select>
          </div>

          {/* Time since last contact */}
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-1">
              When did you last talk?{" "}
              <span className="font-normal text-gray-400 text-sm">(optional)</span>
            </label>
            <select
              value={timeSinceContact}
              onChange={(e) => setTimeSinceContact(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            >
              <option value="">Not sure</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="few-days">A few days ago</option>
              <option value="week">About a week ago</option>
              <option value="weeks">2+ weeks ago</option>
            </select>
          </div>

          {/* Intimacy */}
          <SliderInput
            label="How far did things go?"
            leftLabel="Just vibing"
            rightLabel="Home run"
            value={intimacy}
            min={1}
            max={5}
            onChange={setIntimacy}
            displayValue={INTIMACY_LABELS[intimacy - 1]}
          />

          {/* Weight */}
          <SliderInput
            label="How heavy should this feel?"
            leftLabel="casual, no big deal"
            rightLabel="serious, heartfelt"
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

          {/* Message length */}
          <SliderInput
            label="Message length"
            leftLabel="Very short"
            rightLabel="Very long"
            value={length}
            onChange={setLength}
            displayValue={lengthLabel}
          />

          {/* Grammar level */}
          <SliderInput
            label="Grammar level"
            leftLabel="text speak"
            rightLabel="perfect grammar"
            value={grammarLevel}
            onChange={setGrammarLevel}
            displayValue={grammarLabel}
          />

          {/* Their last message */}
          <div className="mb-6">
            <button
              onClick={() => {
                setShowTheirMessage(!showTheirMessage);
                if (showTheirMessage) setTheirMessage("");
              }}
              className="flex items-center gap-2 font-bold text-gray-700 hover:text-pink-500 transition-colors"
            >
              <span className={`text-pink-400 transition-transform ${showTheirMessage ? "rotate-45" : ""}`}>+</span>
              Responding to their message?
            </button>
            {showTheirMessage && (
              <textarea
                placeholder="Paste their last text here..."
                value={theirMessage}
                onChange={(e) => setTheirMessage(e.target.value)}
                rows={3}
                className="w-full mt-2 border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400 resize-none"
                autoFocus
              />
            )}
          </div>

          {/* Excuse theme */}
          <div className="mb-2">
            <label className="block font-bold text-gray-700 mb-1">
              Excuse theme
            </label>
            <select
              value={excuseOption}
              onChange={(e) => setExcuseOption(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
            >
              {EXCUSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {excuseOption === "custom" && (
              <input
                type="text"
                placeholder="Type your excuse..."
                value={customExcuse}
                onChange={(e) => setCustomExcuse(e.target.value)}
                className="w-full mt-2 border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:border-pink-400"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-black text-xl rounded-2xl transition-colors shadow-md mb-6"
        >
          {loading ? "Fizzling..." : output ? "Regenerate" : "Fizzle 'Em"}
        </button>

        {/* Output */}
        <div className="bg-white rounded-3xl shadow-md p-8 min-h-32">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-pink-300 border-t-pink-500 animate-spin" />
              <span className="text-sm">Fizzling...</span>
            </div>
          )}
          {error && !loading && (
            <p className="text-red-500 font-semibold">{error}</p>
          )}
          {output && !loading && (
            <>
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                {output}
              </p>
              <button
                onClick={copyToClipboard}
                className="mt-6 w-full py-3 border-2 border-pink-300 text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </>
          )}
          {!output && !loading && !error && (
            <p className="text-gray-300 text-sm">Hit the button to generate your message...</p>
          )}
        </div>
      </div>
    </main>
  );
}
