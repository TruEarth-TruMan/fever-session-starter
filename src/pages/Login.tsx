
import LoginForm from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-fever-black flex flex-col items-center justify-center p-4">
      <Link to="/" className="mb-8">
        <div className="mx-auto bg-gradient-to-tr from-fever-red via-fever-amber to-fever-light rounded-full p-2 w-16 h-16 flex items-center justify-center">
          <span className="text-fever-black font-bold text-2xl tracking-tight">F</span>
        </div>
      </Link>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to continue to Fever</p>
      </div>
      
      <LoginForm />
      
      <p className="mt-8 text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-fever-amber hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
