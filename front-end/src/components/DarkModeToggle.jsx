import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center">
      <div
        id="switch"
        className="cursor-pointer overflow-hidden rounded-2xl bg-gray-400 p-1"
        onClick={toggleDarkMode}
      >
        <img
          id="switch-image"
          src="https://ih1.redbubble.net/image.1502616991.7562/st,small,845x845-pad,1000x1000,f8f8f8.jpg"
          alt="Dark mode"
          className={`h-14 w-14 rounded-full transition-all duration-500 ease-in-out ${darkMode ? 'dark-rotate' : ''}`}
        />
      </div>
    </div>
  );
};

export default DarkModeToggle;