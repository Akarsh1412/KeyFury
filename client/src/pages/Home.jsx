import { Zap, Users, ArrowRight, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
  const [typingText, setTypingText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const phrases = [
    "Multiplayer Typing Battles",
    "Real-Time Analytics and Leaderboards",
    "Track Your Accuracy and WPM",
    "Improve Your Typing with Smart Insights",
  ];

  useEffect(() => {
    const currentPhrase = phrases[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting && typingText.length < currentPhrase.length) {
          setTypingText(currentPhrase.slice(0, typingText.length + 1));
        } else if (isDeleting && typingText.length > 0) {
          setTypingText(typingText.slice(0, -1));
        } else {
          setIsDeleting(!isDeleting);
          if (!isDeleting) setTimeout(() => setIsDeleting(true), 1500);
          if (isDeleting) setCurrentIndex((currentIndex + 1) % phrases.length);
        }
      },
      isDeleting ? 50 : 120
    );

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentIndex]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    console.log("FeedBack Received....");
    
    toast.success("Thanks for your feedback!");

    setEmail("");
    setMessage("");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Welcome to <span className="text-[#ef4444]">KeyFury</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            {typingText}
            <span className="ml-1 w-1 h-5 bg-[#ef4444] inline-block animate-pulse"></span>
          </p>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            KeyFury is a competitive multiplayer typing game that helps you
            boost your typing speed and accuracy while analyzing your real-time
            performance.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/type"
              className="flex items-center gap-2 bg-[#d32f2f] text-white px-6 py-3 rounded-md hover:bg-[#b71c1c] transition font-medium"
            >
              <Zap className="w-5 h-5" />
              Start Typing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/multiplayer"
              className="flex items-center gap-2 px-6 py-3 rounded-md border border-gray-600 text-slate-300 hover:bg-[#1f1f1f] transition"
            >
              <Users className="w-5 h-5" />
              Join Multiplayer
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0e0e0e]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why KeyFury?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Analytics",
                desc: "Track your words per minute and accuracy as you type, live.",
              },
              {
                title: "Competitive Multiplayer",
                desc: "Race against others and climb the global leaderboard.",
              },
              {
                title: "Intelligent Insights",
                desc: "Identify your weak spots with smart recommendations and feedback.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] border border-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="py-16 bg-[#121212]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-3">
            View KeyFury on GitHub
          </h2>
          <p className="text-slate-400 mb-6">
            Dive into the code, star the project, or contribute your own
            enhancements.
          </p>
          <a
            href="https://github.com/Akarsh1412/KeyFury"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
          >
            <Github className="w-5 h-5" />
            GitHub Repository
          </a>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-[#0e0e0e]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            We’d Love Your Feedback
          </h2>
          <p className="text-slate-400 mb-10">
            Help us make KeyFury better! Share your thoughts, suggestions, or
            report bugs.
          </p>

          <form onSubmit={handleFeedbackSubmit} className="space-y-6 text-left">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-slate-300 text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-md bg-[#1a1a1a] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-slate-300 text-sm">
                Your Feedback
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                required
                placeholder="Your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-3 rounded-md bg-[#1a1a1a] border border-gray-600 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
              ></textarea>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-3 bg-[#d32f2f] text-white rounded-md hover:bg-[#b71c1c] transition font-medium w-full sm:w-auto"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Home;