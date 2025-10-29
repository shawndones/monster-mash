import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function BloodLynk() {
	const mapRef = useRef(null);
	const mapInstance = useRef(null);
	const markersRef = useRef([]);
	const [type, setType] = useState("");
	const [hours, setHours] = useState("");

	// Funny mock data
	const bloodBanks = useMemo(
		() => [
			{ name: "St. O-Negative Memorial", type: "O-", lat: 40.7128, lng: -74.0060, open: "night", freshness: "Still Warm" },         // NYC
			{ name: "Transylvanian Red Crossroads", type: "A+", lat: 41.8781, lng: -87.6298, open: "any", freshness: "Fresh Draw" },          // Chicago
			{ name: "Mercy Hemoglobin Center", type: "B-", lat: 34.0522, lng: -118.2437, open: "night", freshness: "Day Old" },             // LA
			{ name: "Dr. Fang’s Donation Hub", type: "AB+", lat: 29.7604, lng: -95.3698, open: "day", freshness: "Still Beating" },       // Houston
			{ name: "Count’s Community Plasma Bank", type: "O+", lat: 39.7392, lng: -104.9903, open: "night", freshness: "Vintage 2022" },        // Denver
			{ name: "Hemoglobin & Sons Co-Op", type: "A-", lat: 47.6062, lng: -122.3321, open: "any", freshness: "Brisk but Bright" },    // Seattle
			{ name: "Nocturne Needle Exchange", type: "B+", lat: 25.7617, lng: -80.1918, open: "night", freshness: "Moon-Chilled" },        // Miami
			{ name: "The Scarlet Reserve", type: "AB-", lat: 33.4484, lng: -112.0740, open: "night", freshness: "Desert Dry-Aged" },     // Phoenix
			{ name: "Plasma & Circumstance", type: "O-", lat: 38.9072, lng: -77.0369, open: "any", freshness: "Diplomatically Fresh" },// DC
			{ name: "Midnight Tap & Type", type: "O+", lat: 32.7767, lng: -96.7970, open: "night", freshness: "Tapped at Dusk" },      // Dallas
			{ name: "The Crimson Vault", type: "AB+", lat: 37.7749, lng: -122.4194, open: "day", freshness: "Sommelier Approved" },  // SF
			{ name: "B Positive… Or Else", type: "B+", lat: 36.1699, lng: -115.1398, open: "night", freshness: "High Roller Vintage" }, // Vegas
		],
		[]
	);

	// Create the map once
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) return;

		mapInstance.current = L.map(mapRef.current).setView([39.5, -98.35], 4);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 18,
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(mapInstance.current);

		// initial markers
		renderMarkers(bloodBanks);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Render markers helper
	function renderMarkers(banks) {
		const map = mapInstance.current;
		if (!map) return;

		// Clear old markers
		markersRef.current.forEach((m) => map.removeLayer(m));
		markersRef.current = [];

		banks.forEach((bank) => {
			const marker = L.marker([bank.lat, bank.lng], { icon: makeBloodIcon() })
				.addTo(map)
				.bindPopup(
					`<b>${bank.name}</b>

           🩸 Type: ${bank.type}

           🌙 Hours: ${formatHours(bank.open)}

           ❤️ Freshness: ${bank.freshness}`
				);

			markersRef.current.push(marker);
		});

		if (banks.length > 0) {
			const group = L.featureGroup(markersRef.current);
			map.fitBounds(group.getBounds().pad(0.25));
		}
	}

	// Custom blood-drop icon (SVG) via L.divIcon
	function makeBloodIcon(size = 34) {
		const w = size;
		const h = Math.round(size * 1.35);
		const svg = `
      <svg width="${w}" height="${h}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="g" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stop-color="#ff9fb0"/>
            <stop offset="50%" stop-color="#ff3b58"/>
            <stop offset="100%" stop-color="#a30b2e"/>
          </radialGradient>
        </defs>
        <path d="M12 1 C9 7, 4 12, 4 18 a8 8 0 0 0 16 0 C20 12, 15 7, 12 1 Z"
              fill="url(#g)" stroke="#ffffff" stroke-opacity="0.9" stroke-width="0.8"/>
        <path d="M10 8 C8.5 10, 8 12, 8 13 a1.8 1.8 0 0 0 3 0 c0-1.5-0.5-3-1-5Z"
              fill="#fff" opacity="0.25"/>
      </svg>`;
		return L.divIcon({
			className: "blood-pin",
			html: svg,
			iconSize: [w, h],
			iconAnchor: [w / 2, h - 2],
			popupAnchor: [0, -h + 8],
		});
	}

	function formatHours(open) {
		if (open === "night") return "After Dark";
		if (open === "day") return "Closed During Daylight";
		return "Anytime";
	}

	// Handle filter button
	function applyFilters() {
		const filtered = bloodBanks.filter((bank) => {
			const matchesType = !type || bank.type === type;
			const matchesHours = !hours || bank.open === hours;
			return matchesType && matchesHours;
		});

		// Visual cue for night filter
		if (mapRef.current) {
			mapRef.current.style.filter =
				hours === "night" ? "brightness(0.6) saturate(1.25)" : "none";
		}

		renderMarkers(filtered);
	}

	// Basic styles
	const styles = {
		wrap: {
			position: "relative",
			height: "100vh",
			background: "#0b0b12",
			color: "#eee",
			fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
			overflow: "hidden",
		},
		map: {
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			zIndex: 0,
			transition: "filter 0.4s ease",
		},
		panel: {
			position: "absolute",
			top: 10,
			left: 10,
			background: "rgba(18,18,27,0.95)",
			color: "#fff",
			padding: 15,
			borderRadius: 12,
			maxWidth: 320,
			boxShadow: "0 4px 16px rgba(255,59,88,0.4)",
			zIndex: 9999,
		},
		h1: { fontSize: 18, margin: "0 0 8px", color: "#ff3b58" },
		tagline: { fontSize: 13, marginBottom: 10, color: "#aaa" },
		select: {
			width: "100%",
			margin: "5px 0",
			padding: "6px 8px",
			borderRadius: 6,
			border: "none",
			background: "#1b1b26",
			color: "#eee",
		},
		btn: {
			background: "#ff3b58",
			color: "#fff",
			border: "none",
			padding: "8px 12px",
			borderRadius: 8,
			marginTop: 6,
			cursor: "pointer",
			width: "100%",
			fontWeight: 600,
			boxShadow: "0 0 8px rgba(255,59,88,0.5)",
		},
	};

	// Add a tiny style node for the icon shadow
	useEffect(() => {
		const styleEl = document.createElement("style");
		styleEl.textContent = `.blood-pin{ filter: drop-shadow(0 0 6px rgba(255,59,88,.55)); }`;
		document.head.appendChild(styleEl);
		return () => document.head.removeChild(styleEl);
	}, []);

	return (
		<div style={styles.wrap}>
			<div style={styles.panel}>
				<h1 style={styles.h1}>🩸 Liquid Assets</h1>
				<div style={styles.tagline}>Find your next meal... ethically.</div>

				<label>Preferred Blood Type:</label>
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					style={styles.select}
				>
					<option value="">Any</option>
					<option>A+</option>
					<option>A-</option>
					<option>B+</option>
					<option>B-</option>
					<option>O+</option>
					<option>O-</option>
					<option>AB+</option>
					<option>AB-</option>
				</select>

				<label>Operating Hours:</label>
				<select
					value={hours}
					onChange={(e) => setHours(e.target.value)}
					style={styles.select}
				>
					<option value="">Anytime</option>
					<option value="night">Open After Dark 🌙</option>
					<option value="day">Closed During Daylight ☀️</option>
				</select>

				<button style={styles.btn} onClick={applyFilters}>
					Find Blood Banks
				</button>
			</div>

			<div ref={mapRef} style={styles.map} />
		</div>
	);
}
