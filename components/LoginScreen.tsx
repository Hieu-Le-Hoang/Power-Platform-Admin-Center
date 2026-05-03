import React, { useState } from 'react';
import { verifyCredentials, logSignIn } from '../services/googleSheetsService';
import type { Theme } from '../types';
import { CubeIcon } from './IconComponents';

interface LoginScreenProps {
  onLoginSuccess: (notification?: string) => void;
  theme: Theme;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await verifyCredentials(password);
      if (isValid) {
        try {
          await logSignIn('Authenticated User');
          onLoginSuccess();
        } catch (logError) {
          if (logError instanceof Error && logError.message === 'LOG_URL_NOT_CONFIGURED') {
            onLoginSuccess("Sign-in logging is not configured. Please contact an administrator.");
          } else {
            onLoginSuccess("Login successful, but could not record sign-in event.");
          }
        }
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Could not connect to the authentication service. Please check your network and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const themeStyles = {
    dark: {
        bg: 'bg-[#0B253A]',
        border: 'border-[#143B54]',
        text: 'text-[#F3F4F6]',
        secondaryText: 'text-[#A7B1C2]',
        inputBg: 'bg-[#011627]',
        inputBorder: 'border-[#143B54]',
        inputFocusRing: 'focus:ring-[#2563EB]',
        inputFocusBorder: 'focus:border-[#2563EB]',
        buttonBg: 'bg-[#2563EB]',
        buttonHoverBg: 'hover:bg-[#1D4ED8]',
        buttonFocusRingOffset: 'focus:ring-offset-[#0B253A]',
        buttonDisabledBg: 'disabled:bg-[#2563EB]/50',
    },
    light: {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        secondaryText: 'text-gray-500',
        inputBg: 'bg-gray-50',
        inputBorder: 'border-gray-300',
        inputFocusRing: 'focus:ring-indigo-500',
        inputFocusBorder: 'focus:border-indigo-500',
        buttonBg: 'bg-indigo-600',
        buttonHoverBg: 'hover:bg-indigo-700',
        buttonFocusRingOffset: 'focus:ring-offset-white',
        buttonDisabledBg: 'disabled:bg-indigo-500/50',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`w-full max-w-md p-8 space-y-8 ${currentTheme.bg} border ${currentTheme.border} rounded-xl shadow-lg`}>
        <div className="flex flex-col items-center">
          <CubeIcon className="h-12 w-12 text-blue-500 mb-4" />
          <h2 className={`text-3xl font-bold text-center ${currentTheme.text}`}>
            Power Platform Admin Center
          </h2>
          <p className={`mt-2 text-center text-sm ${currentTheme.secondaryText}`}>
            Please log in to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none relative block w-full px-3 py-3 border ${currentTheme.inputBorder} ${currentTheme.inputBg} ${currentTheme.text} placeholder-[#A7B1C2] focus:outline-none ${currentTheme.inputFocusRing} ${currentTheme.inputFocusBorder} focus:z-10 sm:text-sm rounded-md`}
                placeholder={'Pass wifi "Phong IT 5Ghz"'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-error"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p id="password-error" className="text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 mt-4 border border-transparent text-sm font-medium rounded-md text-white ${currentTheme.buttonBg} ${currentTheme.buttonHoverBg} ${currentTheme.buttonDisabledBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.buttonFocusRingOffset} focus:ring-[#2563EB] transition-colors disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;