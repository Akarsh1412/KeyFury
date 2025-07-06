import { Zap, Users, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [typingText, setTypingText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const phrases = [
    'Transform your productivity',
    'Master digital communication',
    'Unlock your potential',
    'Elevate your skills'
  ];

  useEffect(() => {
    const currentPhrase = phrases[currentIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting && typingText.length < currentPhrase.length) {
        setTypingText(currentPhrase.slice(0, typingText.length + 1));
      } else if (isDeleting && typingText.length > 0) {
        setTypingText(typingText.slice(0, -1));
      } else {
        setIsDeleting(!isDeleting);
        if (!isDeleting) setTimeout(() => setIsDeleting(true), 1500);
        if (isDeleting) setCurrentIndex((currentIndex + 1) % phrases.length);
      }
    }, isDeleting ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentIndex]);

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Elevate Your <span className="text-[#ef4444]">Typing Mastery</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            {typingText}
            <span className="ml-1 w-1 h-5 bg-[#ef4444] inline-block animate-pulse"></span>
          </p>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Personalized AI-powered typing platform. Learn faster. Type smarter.
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
          <h2 className="text-3xl font-bold text-center text-white mb-12">What Makes KeyFury Different?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-Time Feedback',
                desc: 'Monitor your WPM and accuracy with instant feedback.',
              },
              {
                title: 'Smart Recommendations',
                desc: 'Get personalized lessons tailored to your weaknesses.',
              },
              {
                title: 'Global Rankings',
                desc: 'Compete worldwide and climb the leaderboard.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] border border-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#141414]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8">
            Join 500,000+ users improving their typing with KeyFury
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-[#d32f2f] text-white rounded-md font-medium hover:bg-[#b71c1c] transition"
          >
            Start Your Journey
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home