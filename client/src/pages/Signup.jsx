import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { getFirebaseErrorMessage } from '../utils/helpers';
import LoadingScreen from '../components/LoadingScreen';

function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Creating your account...');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setLoadingMessage('Setting up your profile...');
      await updateProfile(userCredential.user, { displayName });
      setLoadingMessage('Account created! Redirecting...');
      toast.success('Account created successfully!');
    
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      const msg = getFirebaseErrorMessage(err.code);
      toast.error(msg);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setLoadingMessage('Signing up with Google...');
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setLoadingMessage('Account created! Redirecting...');
      toast.success('Signed up with Google!');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      const msg = getFirebaseErrorMessage(err.code);
      toast.error(msg);
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} subtitle="Join the KeyFury community" />;
  }

  return (
    <section className="flex items-center justify-center bg-[#121212] px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Your KeyFury Account</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Display Name"
            className="w-full px-4 py-3 bg-[#0e0e0e] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] transition-all"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="true"
            required
            disabled={isLoading}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-[#0e0e0e] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="true"
            required
            disabled={isLoading}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-[#0e0e0e] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef4444] transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            className="w-full bg-[#d32f2f] text-white py-3 rounded-md hover:bg-[#b71c1c] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-700" />
          <span className="text-gray-400 px-4 text-sm">or</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 border border-gray-600 text-white py-3 rounded-md hover:bg-[#1f1f1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <FcGoogle className="text-xl" />
          {isLoading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <span
            onClick={() => !isLoading && navigate('/login')}
            className={`text-[#ef4444] hover:underline cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Login
          </span>
        </p>
      </div>
    </section>
  );
}

export default Signup;