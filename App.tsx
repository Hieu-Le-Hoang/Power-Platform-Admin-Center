import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import type { Theme } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  const handleLoginSuccess = (message?: string) => {
    setIsAuthenticated(true);
    if (message) {
      setNotification(message);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const themeClasses = theme === 'dark' ? 'bg-[#011627] text-[#F3F4F6]' : 'bg-gray-100 text-gray-800';

  return (
    <div className={`min-h-screen font-sans ${themeClasses}`}>
      {!isAuthenticated ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} theme={theme} />
      ) : (
        <AdminDashboard 
          notification={notification} 
          setNotification={setNotification}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;