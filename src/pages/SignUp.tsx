import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Languages, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNextLanguage = (current: string): 'en' | 'th' | 'zh' => {
    const languages: ('en' | 'th' | 'zh')[] = ['en', 'th', 'zh'];
    const currentIndex = languages.indexOf(current as 'en' | 'th' | 'zh');
    return languages[(currentIndex + 1) % languages.length];
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await signUp(email, password);
      
      if (result.success) {
        // Use direct navigation with window.location.href instead of React Router
        // This can help prevent freezing issues during navigation
        console.log('Using direct navigation to onboarding');
        window.location.href = '/onboarding/personal-info';
        
        // Return early since we're navigating away
        return;
      } else {
        setError(result.message || 'Failed to create account');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-[#1E4D3A] to-[#2a6b51]">
        <header className="fixed w-full top-0 bg-transparent z-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors duration-200 text-[#F5F5F2] opacity-80 hover:opacity-100"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setLanguage(getNextLanguage(language))}
              className="flex items-center space-x-2 text-[#F5F5F2] opacity-80 hover:opacity-100"
            >
              <Languages size={20} />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>
          </div>
        </header>
        <main className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-[#F5F5F2] text-6xl font-semibold tracking-tight font-mukta">LiQid</h1>
              <p className="text-[#F5F5F2] mt-4 text-lg opacity-80">
                {t('transform_stories')}
              </p>
            </div>
            <div className="bg-[#F5F5F2] rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-[#1E4D3A] mb-6">{t('create_account')}</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <label className="block text-sm font-medium text-[#577B92] mb-1">{t('email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#1E4D3A] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#577B92] mb-1">{t('password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#1E4D3A] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#db2777] text-white font-medium hover:opacity-90 transition-opacity shadow-md flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    t('sign_up')
                  )}
                </button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#F5F5F2] text-[#577B92]">{t('or_continue_with')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="flex items-center justify-center py-2.5 px-4 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm text-[#577B92]">Google</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="flex items-center justify-center py-2.5 px-4 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C 15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                    </svg>
                    <span className="text-sm text-[#577B92]">Facebook</span>
                  </button>
                </div>
              </form>
              <p className="mt-6 text-center text-sm text-[#577B92]">
                {t('already_have_account')}
                <Link to="/signin" className="text-[#E86F2C] hover:underline ml-1">
                  {t('sign_in')}
                </Link>
              </p>
            </div>
          </div>
        </main>
        <footer className="absolute bottom-0 w-full py-6 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#F5F5F2] opacity-80">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-[#E86F2C]/20 flex items-center justify-center mr-3">
                <User size={16} className="text-[#F5F5F2]" />
              </div>
              <p>{t('developed_by')}</p>
            </div>
            <p>© 2025 LiQid. {t('all_rights_reserved')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SignUp;
