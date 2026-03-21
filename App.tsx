import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

function App() {
	return (
		<div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300 font-sans selection:bg-primary-500 selection:text-white">
			<Navbar />
			<main>
				<Hero />
				<Experience />
				<Skills />
				<Projects />
				<Education />
			</main>
			<Footer />
			{/* <ChatWidget /> */}
		</div>
	);
}

export default App;
