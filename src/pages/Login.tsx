
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-fever-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to continue to Fever</p>
      </div>
      <LoginForm />
    </div>
  );
}
