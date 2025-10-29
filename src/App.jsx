import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, Link } from "react-router-dom";

import CommitGenerator from './CommitGenerator.jsx';
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

export default function App() {
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
		<div className="mx-auto w-[90%] px-4 py-10">


			<div className="min-h-screen bg-zinc-950 text-zinc-100">
				<nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
					<Link to="/" className="font-bold text-green text-lg">Monster Mash</Link>
					<div className="flex gap-4 text-sm">
						<Link to="/" className="hover:text-green-dark">CommitGenerator</Link>
						<Link to="/liquid-assets" className="hover:text-green-dark">Liquid Assets</Link>
					</div>
				</nav>

				<main className="p-6">
					<Routes>
						<Route path="/" element={<CommitGenerator />} />
						<Route path="/liquid-assets" element={<LiquidAssets />} />
					</Routes>
				</main>
			</div>


			<footer className="mt-10 text-center text-zinc-500 text-sm">
				<p><kbd className="px-1.5 py-0.5 border border-zinc-700 rounded">Enter</kbd> to summon.</p><br />
				<p>&copy; 2026 <code>Shawn, Jonathan and Jeremy</code>. Code Commanders.</p>
			</footer>
		</div>
	);
}
