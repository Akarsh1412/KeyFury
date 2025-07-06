import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login to KeyFury</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name='email'
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-[#0e0e0e] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete='true'
            required
          />
          <input
            name='password'
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-[#0e0e0e] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-[#d32f2f] text-white py-3 rounded-md hover:bg-[#b71c1c] transition font-medium"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-700" />
          <span className="text-gray-400 px-4 text-sm">or</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-600 text-white py-3 rounded-md hover:bg-[#1f1f1f] transition"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-[#ef4444] hover:underline cursor-pointer"
          >
            Create account
          </span>
        </p>
      </div>
    </section>
  );
};

export default Login;
