
import SignupForm from '@/components/auth/SignupForm';

export default function Signup() {
  return (
    <div className="min-h-screen bg-fever-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
        <p className="text-gray-400">Join Fever and start making music</p>
      </div>
      <SignupForm />
    </div>
  );
}
