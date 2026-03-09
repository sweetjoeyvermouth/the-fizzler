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

function FallingHearts() {
  const [hearts, setHearts] = useState<Array<{
    id: number; left: number; delay: number; duration: number; size: number; rot: number;
  }>>([]);

  useState(() => {
    setHearts(
      Array.from({ length: 11 }, (_, i) => ({
        id: i,
        left: 4 + Math.random() * 90,
        delay: Math.random() * 14,
        duration: 10 + Math.random() * 7,
        size: 26 + Math.floor(Math.random() * 18),
        rot: (Math.random() - 0.5) * 24,
      }))
    );
  });

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998, overflow: "hidden" }}>
      {hearts.map((h) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={h.id}
          src="/heart.png"
          alt=""
          style={{
            position: "absolute",
            top: "-70px",
            left: `${h.left}%`,
            width: `${h.size}px`,
            height: "auto",
            imageRendering: "pixelated",
            animation: `heartFall ${h.duration}s ${h.delay}s linear infinite`,
            ["--heart-rot" as string]: `${h.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

function PixelLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <span className="pixel-label">
      {children}
      {optional && <span className="optional">optional</span>}
    </span>
  );
}

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
        <span className="pixel-label" style={{ marginBottom: 0, flex: 1 }}>{label}</span>
        {displayValue && (
          <span style={{ fontFamily: "var(--font-pixel, monospace)", fontSize: "9px", color: "var(--neon-green)", flexShrink: 0, paddingTop: "1px" }}>
            {displayValue}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "15px", color: "var(--muted)", width: "60px", textAlign: "right", flexShrink: 0, fontFamily: "var(--font-vt, monospace)", lineHeight: "1.2" }}>
          {leftLabel}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, minWidth: 0 }}
        />
        <span style={{ fontSize: "15px", color: "var(--muted)", width: "60px", flexShrink: 0, fontFamily: "var(--font-vt, monospace)", lineHeight: "1.2" }}>
          {rightLabel}
        </span>
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
    "perfect";

  const lengthLabel =
    length <= 2 ? "very short" :
    length <= 4 ? "short" :
    length <= 6 ? "medium" :
    length <= 8 ? "long" :
    "very long";

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg)", padding: "40px 24px", position: "relative", zIndex: 1 }}>
      <FallingHearts />
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header — logo image */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="The Fizzler — Let them down easy"
            style={{ maxWidth: "380px", width: "100%", margin: "0 auto", display: "block" }}
          />
        </div>

        {/* Controls card */}
        <div className="fizzle-card" style={{ padding: "32px", marginBottom: "20px" }}>

          {/* Got a text from them */}
          <div style={{ marginBottom: "28px" }}>
            <PixelLabel optional>Got a text from them?</PixelLabel>
            <p style={{ fontSize: "18px", color: "var(--muted)", marginBottom: "10px", fontFamily: "var(--font-vt, monospace)", lineHeight: "1.3" }}>
              Paste their last message — we&apos;ll write a reply that lets them down naturally.
            </p>
            <textarea
              className="dark-input"
              placeholder="Paste their last text here..."
              value={theirMessage}
              onChange={(e) => setTheirMessage(e.target.value)}
              rows={3}
            />
          </div>

          <hr className="section-divider" />

          {/* Name */}
          <div style={{ marginBottom: "24px" }}>
            <PixelLabel optional>Their name</PixelLabel>
            <input
              className="dark-input"
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Number of dates */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <span className="pixel-label" style={{ marginBottom: 0 }}>How many dates?</span>
              <span style={{ fontFamily: "var(--font-pixel, monospace)", fontSize: "9px", color: "var(--neon-green)" }}>
                {numDates === 10 ? "10+" : numDates}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={numDates}
              onChange={(e) => setNumDates(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          {/* How you met */}
          <div style={{ marginBottom: "24px" }}>
            <PixelLabel>How did you meet?</PixelLabel>
            <select
              className="dark-input"
              value={howMet}
              onChange={(e) => setHowMet(e.target.value)}
            >
              {HOW_MET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Their vibe */}
          <div style={{ marginBottom: "24px" }}>
            <PixelLabel optional>What&apos;s their vibe?</PixelLabel>
            <select
              className="dark-input"
              value={theirVibe}
              onChange={(e) => setTheirVibe(e.target.value)}
            >
              <option value="">Not sure / doesn&apos;t matter</option>
              <option value="really-into-me">Really into me</option>
              <option value="intense">A bit intense / moving fast</option>
              <option value="casual">Pretty casual about it</option>
              <option value="sweet-no-spark">Super sweet, just no spark</option>
              <option value="hard-to-read">Hard to read</option>
            </select>
          </div>

          {/* Time since contact */}
          <div style={{ marginBottom: "28px" }}>
            <PixelLabel optional>When did you last talk?</PixelLabel>
            <select
              className="dark-input"
              value={timeSinceContact}
              onChange={(e) => setTimeSinceContact(e.target.value)}
            >
              <option value="">Not sure</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="few-days">A few days ago</option>
              <option value="week">About a week ago</option>
              <option value="weeks">2+ weeks ago</option>
            </select>
          </div>

          <hr className="section-divider" />

          {/* Sliders */}
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

          <SliderInput
            label="How heavy should this feel?"
            leftLabel="casual"
            rightLabel="heartfelt"
            value={sincerity}
            onChange={setSincerity}
          />

          <SliderInput
            label="Keep the door open?"
            leftLabel="door is SHUT"
            rightLabel="maybe someday"
            value={doorOpen}
            onChange={setDoorOpen}
          />

          <SliderInput
            label="Message length"
            leftLabel="short"
            rightLabel="long"
            value={length}
            onChange={setLength}
            displayValue={lengthLabel}
          />

          <SliderInput
            label="Grammar level"
            leftLabel="text speak"
            rightLabel="proper"
            value={grammarLevel}
            onChange={setGrammarLevel}
            displayValue={grammarLabel}
          />

          <hr className="section-divider" />

          {/* Excuse theme */}
          <div>
            <PixelLabel>Excuse theme</PixelLabel>
            <select
              className="dark-input"
              value={excuseOption}
              onChange={(e) => setExcuseOption(e.target.value)}
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
                className="dark-input"
                style={{ marginTop: "10px" }}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="fizzle-btn"
          style={{ marginBottom: "20px" }}
        >
          {loading ? "FIZZLING..." : output ? "REGENERATE" : "FIZZLE 'EM"}
        </button>

        {/* Output */}
        <div className="fizzle-card" style={{ padding: "32px", minHeight: "120px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)" }}>
              <div className="spinner" />
              <span style={{ fontFamily: "var(--font-vt, monospace)", fontSize: "18px" }}>Fizzling...</span>
            </div>
          )}
          {error && !loading && (
            <p style={{ color: "#ff4d6a", fontFamily: "var(--font-pixel, monospace)", fontSize: "9px" }}>{error}</p>
          )}
          {output && !loading && (
            <>
              <p className="output-text">{output}</p>
              <button
                onClick={copyToClipboard}
                className={`copy-btn${copied ? " copied" : ""}`}
              >
                {copied ? "COPIED!" : "COPY TO CLIPBOARD"}
              </button>
            </>
          )}
          {!output && !loading && !error && (
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-pixel, monospace)", fontSize: "9px", lineHeight: "1.8" }}>
              Hit the button to<br />generate your message...
            </p>
          )}
        </div>

      </div>
    </main>
  );
}
