/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				green: "#22c55e",
				'green-dark': '#4caf50',
			},
			boxShadow: {
				glow: "0 0 30px rgba(124, 58, 237, .35)",
			},
			screens: {
				/* Start @gce/gcu-bootstrap variables  */
				'screen-mo-min': '0px',
				'screen-min': '360px',
				'sm-min': '480px',
				'sm-sm-min': '768px',
				'sm-md-min': '992px',
				'sm-lg-min': '1180px',
				/* End @gce/gcu-bootstrap variables */
				xxs: '0px',
				xs: '360px',
				sm: '480px',
				md: '768px',
				lg: '1180px',
				xl: '1350px',
				'2xl': '1536px',

				DEFAULT: '1500px',
			},
		},
	},
	plugins: [],
};
