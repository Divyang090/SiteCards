import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PinterestSuccess() {
  const navigate = useNavigate();

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Generate sprinkle/confetti particles
  const particles = Array.from({ length: 35 });

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden">

      {/* BACKGROUND SPRINKLES */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ["#E60023", "#FF8A80", "#FFCDD2"][i % 3],
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0],
            y: [0, -20],
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* CARD */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/70 backdrop-blur-lg px-10 py-8 rounded-2xl shadow-xl border border-red-200 text-center z-10"
      >
        {/* Pinterest Logo Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-red-600 mb-4"
        >
          <span className="text-white text-4xl font-semibold">P</span>
        </motion.div>

        <h1 className="text-3xl font-bold text-red-600 mb-2">
          Pinterest Connected!
        </h1>

        <p className="text-gray-600 mb-6">
          Your Pinterest account has been linked successfully.  
          Redirecting you to your dashboard…
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 transition text-white rounded-lg shadow-md"
        >
          Go to Dashboard Now
        </button>
      </motion.div>
    </div>
  );
}