import { useState } from 'react';
import AuthLayout from '../components/AuthScreen/AuthLayout';
import AuthSuccessState from '../components/AuthScreen/AuthSuccessState';
import LoginForm from '../components/AuthScreen/LoginForm';
import SignupForm from '../components/AuthScreen/SignupForm';

type AuthMode = 'login' | 'signup';

interface AuthScreenProps {
  onContinue: () => void;
}

export default function AuthScreen({ onContinue }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [success, setSuccess] = useState<AuthMode | null>(null);

  const switchMode = () => {
    setSuccess(null);
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
  };

  return (
    <AuthLayout>
      {success ? (
        <AuthSuccessState mode={success} onContinue={onContinue} />
      ) : mode === 'login' ? (
        <LoginForm onSubmit={() => setSuccess('login')} onSwitch={switchMode} />
      ) : (
        <SignupForm onSubmit={() => setSuccess('signup')} onSwitch={switchMode} />
      )}
    </AuthLayout>
  );
}
