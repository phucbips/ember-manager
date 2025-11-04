import React, { useState } from 'react';
import { 
    signInWithGoogle, 
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset
} from './services/firebaseService';

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await signInWithGoogle();
      // Auth state change will be handled by the listener in App.tsx
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signUp') {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }
        try {
            await signUpWithEmail(email, password);
            setMessage("Account created successfully! You are now signed in.");
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        }
    } else if (mode === 'signIn') {
        try {
            await signInWithEmail(email, password);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        }
    } else if (mode === 'resetPassword') {
        try {
            await sendPasswordReset(email);
            setMessage("Password reset link sent! Please check your email inbox.");
        } catch(err) {
            setError(getFriendlyErrorMessage(err));
        }
    }
    
    setIsLoading(false);
  };

  const getFriendlyErrorMessage = (error: any): string => {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  const renderForm = () => {
    if (mode === 'resetPassword') {
        return (
            <>
                <p className="text-gray-600 mb-6 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </>
        )
    }

    return (
      <>
        <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">Email</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="mb-6">
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 text-left mb-1">Password</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        {mode === 'signUp' && (
            <div className="mb-6">
                <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700 text-left mb-1">Confirm Password</label>
                <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
        )}

        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400">
          {isLoading ? 'Processing...' : (mode === 'signIn' ? 'Sign In' : 'Sign Up')}
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">📚 Embed Manager</h1>
        <p className="text-gray-600 mb-6">{mode === 'signIn' ? 'Sign in to your account' : mode === 'signUp' ? 'Create a new account' : 'Reset your password'}</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}

        <form onSubmit={handleEmailSubmit}>
            {renderForm()}
        </form>

        <div className="mt-4 text-sm text-center">
            {mode === 'signIn' && (
                <>
                    <button onClick={() => switchMode('signUp')} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Don't have an account? Sign Up
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button onClick={() => switchMode('resetPassword')} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot Password?
                    </button>
                </>
            )}
            {mode === 'signUp' && (
                <button onClick={() => switchMode('signIn')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Already have an account? Sign In
                </button>
            )}
            {mode === 'resetPassword' && (
                 <button onClick={() => switchMode('signIn')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Back to Sign In
                </button>
            )}
        </div>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.35 6.48C12.73 13.72 17.94 9.5 24 9.5z"></path>
            <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.91 28.72c-.36-.81-.56-1.68-.56-2.59s.2-1.78.56-2.59l-8.35-6.48C.73 19.62 0 21.76 0 24s.73 4.38 2.56 6.22l8.35-6.5z"></path>
            <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.52 1.7-5.74 2.68-9.16 2.68-6.06 0-11.21-4.22-13.08-9.98l-8.35 6.48C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Sign in with Google
        </button>
      </div>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>A simple solution for content embedding.</p>
      </footer>
    </div>
  );
};

export default LoginPage;