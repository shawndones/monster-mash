import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, Link } from "react-router-dom";

import LiquidAssets from "./LiquidAssets.jsx";

function useCursedMessages() {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const res = await fetch("/commits.json", { cache: "no-store" });
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				if (alive) setMessages(Array.isArray(data.messages) ? data.messages : []);
			} catch (e) {
				if (alive) setError(e);
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => { alive = false; };
	}, []);

	return { messages, loading, error };
}

export default function CommitGenerator() {
	const { messages, loading, error } = useCursedMessages();
	const [query, setQuery] = useState("");
	const [current, setCurrent] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return messages;
		return messages.filter((m) => m.toLowerCase().includes(q));
	}, [messages, query]);

	const roll = useCallback(() => {
		if (!filtered.length) {
			setCurrent("👻 No messages match your filter. Clear it and try again.");
			return;
		}
		const idx = Math.floor(Math.random() * filtered.length);
		setCurrent(filtered[idx]);
	}, [filtered]);

	const copy = useCallback(async () => {
		if (!current) return;
		const gitMsg = `git commit -m "${current.replace(/"/g, '\\"')}"`;
		await navigator.clipboard.writeText(gitMsg);
	}, [current]);

	// Enter key summons message
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Enter") roll();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [roll]);

	return (
		<div className="mx-auto w-full px-4 py-10">
			<header className="mb-8 text-center">
				<h1 className="text-3xl md:text-4xl font-black tracking-tight">
					<span className="text-green-dark">Cursed</span> Commit Generator
				</h1>
				<p className="mt-2 text-zinc-400">Halloween-edition, work-safe snark.</p>
			</header>

			<section className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Filter (e.g. ghost, QA, CSS, merge)…"
					className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
					aria-label="Filter commit messages"
				/>
				<button
					onClick={roll}
					disabled={loading || !!error}
					className="rounded-xl bg-green-dark px-5 py-3 font-semibold hover:bg-green active:translate-y-px disabled:opacity-50 shadow-glow"
				>
					Summon Message
				</button>
			</section>

			<div className="rounded-2xl border border-zinc-800 bg-black/60 p-5 shadow-inner">
				<div className="font-mono text-sm text-zinc-400 mb-2 select-none">bash</div>
				<div className="font-mono text-lg bg-zinc-950 rounded-xl border border-zinc-900 p-4 overflow-x-auto">
					<pre className="whitespace-pre-wrap break-words" aria-live="polite">
						{current
							? `git commit -m "${current}"`
							: loading
								? "summoning messages from /commits.json…"
								: error
									? `uh oh… ${error.message}`
									: "click “Summon Message” or type to filter, then click again"}
					</pre>
				</div>

				<div className="mt-4 flex flex-wrap gap-3">
					<button
						onClick={copy}
						disabled={!current}
						className="rounded-lg border border-zinc-800 px-4 py-2 hover:border-purple-500 disabled:opacity-50"
						title="Copy to clipboard"
					>
						Copy
					</button>
					<button
						onClick={() => setCurrent("")}
						className="rounded-lg border border-zinc-800 px-4 py-2 hover:border-zinc-700"
					>
						Clear
					</button>
					<a
						href="https://git-scm.com/docs/git-commit"
						target="_blank"
						rel="noreferrer"
						className="rounded-lg border border-zinc-800 px-4 py-2 hover:border-zinc-700"
					>
						What’s a good commit message?
					</a>
				</div>
			</div>

			<footer className="mt-10 text-center text-zinc-500 text-sm">
				<p><kbd className="px-1.5 py-0.5 border border-zinc-700 rounded">Enter</kbd> to summon.</p><br />
				<p>&copy; 2026 <code>Shawn, Jonathan and Jeremy</code>. Code Commanders.</p>
			</footer>
		</div>
	);
}
