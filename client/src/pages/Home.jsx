import {
  Zap,
  Users,
  ArrowRight,
  Github,
  MessageCircle,
  Send,
} from "lucide-react";
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
    "Improve your typing speed",
    "Challenge friends online",
    "Track your progress",
    "Master the keyboard",
  ];

  useEffect(() => {
    const currentPhrase = phrases[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting && typingText.length < currentPhrase.length) {
          setTypingText(currentPhrase.slice(0, typingText.length + 1));
        } else if (isDeleting && typingText.length > 0) {
          setTypingText(typingText.slice(0, -1));
        } else if (!isDeleting && typingText.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && typingText.length === 0) {
          setIsDeleting(false);
          setCurrentIndex((currentIndex + 1) % phrases.length);
        }
      },
      isDeleting ? 50 : 120
    );

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentIndex, phrases]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    toast.success("Thanks for your feedback!");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-[#121212] relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#d32f2f]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d32f2f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
            <span className="text-[#d32f2f] hover:text-[#b71c1c] transition-colors duration-300">
              KeyFury
            </span>
          </h1>

          <div className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 min-h-[3rem] flex items-center justify-center animate-fade-in-delay">
            <span className="inline-block">
              {typingText}
              <span className="ml-1 w-0.5 h-6 bg-[#d32f2f] inline-block animate-pulse"></span>
            </span>
          </div>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-delay-2">
            A clean, fast typing test with real-time analytics and multiplayer
            challenges.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-delay-3">
            <Link
              to="/type"
              className="group flex items-center justify-center gap-2 bg-[#d32f2f] text-white px-8 py-4 rounded-lg hover:bg-[#b71c1c] transition-all duration-300 font-medium text-lg transform hover:scale-105 hover:shadow-lg"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              Start Typing Test
            </Link>
            <Link
              to="/multiplayer"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#1f1f1f] hover:border-[#d32f2f] transition-all duration-300 font-medium text-lg transform hover:scale-105"
            >
              <Users className="w-5 h-5 group-hover:text-[#d32f2f] transition-colors" />
              Multiplayer Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12 md:mb-16 animate-fade-in-up">
            Everything you need to improve your typing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Zap,
                title: "Real-time Stats",
                desc: "Track your WPM, accuracy, and progress as you type",
                delay: "delay-100",
              },
              {
                icon: Users,
                title: "Multiplayer",
                desc: "Race against friends and compete on leaderboards",
                delay: "delay-200",
              },
              {
                icon: MessageCircle,
                title: "Clean Interface",
                desc: "Distraction-free design focused on your typing experience",
                delay: "delay-300",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-6 animate-fade-in-up ${feature.delay} hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="w-16 h-16 bg-[#d32f2f] rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b71c1c] group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
                  <feature.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#d32f2f] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub Section */}
      <section className="py-12 md:py-16 bg-[#121212]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 animate-fade-in-up">
            Open Source
          </h2>
          <p className="text-gray-400 mb-8 animate-fade-in-up delay-100">
            KeyFury is open source. View the code, contribute, or report issues
            on GitHub.
          </p>
          <a
            href="https://github.com/Akarsh1412/KeyFury"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1f1f1f] border border-gray-600 text-white rounded-lg hover:bg-[#2a2a2a] hover:border-[#d32f2f] transition-all duration-300 transform hover:scale-105 animate-fade-in-up delay-200"
          >
            <Github className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            View on GitHub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </section>

      {/* Enhanced Feedback Section */}
      <section className="py-16 md:py-20 bg-[#0f0f0f]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 animate-fade-in-up">
              Feedback
            </h2>
            <p className="text-gray-400 animate-fade-in-up delay-100">
              Help us improve KeyFury with your suggestions and feedback.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 md:p-8 hover:border-gray-600 transition-all duration-300 animate-fade-in-up delay-200">
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-[#d32f2f] transition-colors duration-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d32f2f] focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>

              <div className="group">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-[#d32f2f] transition-colors duration-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  required
                  placeholder="Your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-600 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#d32f2f] focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>

              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-2 bg-[#d32f2f] text-white py-3 rounded-lg hover:bg-[#b71c1c] transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                Send Feedback
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </>
  );
}

export default Home;