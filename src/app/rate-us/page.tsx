"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Page() {
  const reviewUrl =
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    `https://www.google.com/search?client=ms-android-realme-terr1-rso2&sca_esv=1ebdc27bd3b18e70&hl=en-IN&cs=0&sxsrf=ANbL-n78MtFX5ryeAz4NQpXRBUO30w4lsA:1780880424336&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOZRNIDvmsWyVF2_Z6dqMqiSoyjkPnUm9UdaOefUOjDCu6BkSQt0nf54RKw-4zTsd-40Lo0Kn7vzubjsYaGjIgvUi6DYcmv6XPrCEMyIqjXMABv4H3Q%3D%3D&q=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_NAME || "TravelCRM")}+Reviews&sa=X&ved=2ahUKEwjC1NHIuPaUAxVjX2wGHVepLqkQ0bkNegQIIRAH&biw=1470&bih=803&dpr=2#lrd=0x39f89b820fef46dd:0x6e16a6d555f5fb16,3,,,,`;

  const handleRedirect = () => {
    window.location.href = reviewUrl;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#051c15] text-[#e2e8f0] overflow-hidden px-4">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#0f3d2f] opacity-40 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#c5a059] opacity-10 blur-[150px]" />

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center"
      >
        {/* Colorful Lotus Logo (Vector SVG) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <svg
            width="64"
            height="48"
            viewBox="0 0 120 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lotus Petals */}
            <path
              d="M60 10 C50 35, 70 35, 60 10 Z"
              fill="#c5a059"
              opacity="0.9"
            />
            <path d="M60 10 C42 32, 58 45, 60 10 Z" fill="#4285F4" />
            <path d="M60 10 C78 32, 62 45, 60 10 Z" fill="#EA4335" />
            <path d="M60 10 C30 40, 50 55, 60 10 Z" fill="#FBBC05" />
            <path d="M60 10 C90 40, 70 55, 60 10 Z" fill="#34A853" />
            <path d="M60 10 C20 52, 42 62, 60 10 Z" fill="#8E44AD" />
            <path d="M60 10 C100 52, 78 62, 60 10 Z" fill="#D35400" />
          </svg>
        </motion.div>

        {/* Company Title */}
        <h1 className="text-xl font-bold tracking-wider font-serif text-[#ffffff] uppercase mb-1">
          {process.env.NEXT_PUBLIC_APP_NAME || "TravelCRM"}
        </h1>
        <p className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-medium mb-6">
          Curated Journeys. Lasting Memories.
        </p>

        {/* Golden 5-Star Row with bounce effect */}
        <div className="flex items-center gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((star, index) => (
            <motion.div
              key={star}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 180 }}
            >
              <Star className="w-6 h-6 fill-[#c5a059] text-[#c5a059]" />
            </motion.div>
          ))}
        </div>

        {/* Short Feedback Message */}
        <h2 className="text-lg font-semibold text-[#ffffff] mb-3">
          How was your journey?
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed px-2 mb-8">
          Your feedback motivates us and helps us create even better travel experiences.
        </p>

        {/* Leave a Google Review Button */}
        <motion.button
          onClick={handleRedirect}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(197, 160, 89, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#c5a059] to-[#b08b3e] text-[#051c15] font-bold py-3.5 px-6 rounded-xl transition-all duration-200 hover:brightness-110 shadow-lg text-sm tracking-wide uppercase"
        >
          Leave a Google Review
        </motion.button>
      </motion.div>

      {/* Subtle Bottom Footer */}
      <div className="absolute bottom-6 text-[10px] text-gray-500 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "TravelCRM"}
      </div>
    </div>
  );
}
