import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ size = 'default', showLabel = false }) => {
    const { isDark, toggleTheme } = useTheme();

    const sizeClasses = {
        small: 'p-1.5',
        default: 'p-2',
        large: 'p-3'
    };

    const iconSizes = {
        small: 16,
        default: 20,
        large: 24
    };

    return (
        <button
            onClick={toggleTheme}
            className={`${sizeClasses[size]} rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2`}
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative">
                <Sun
                    size={iconSizes[size]}
                    className={`transition-all duration-300 ${
                        isDark
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100 text-yellow-400'
                    } absolute inset-0`}
                />
                <Moon
                    size={iconSizes[size]}
                    className={`transition-all duration-300 ${
                        isDark
                            ? 'opacity-100 rotate-0 scale-100 text-blue-400'
                            : 'opacity-0 -rotate-90 scale-0'
                    }`}
                />
            </div>
            {showLabel && (
                <span className="text-sm">
                    {isDark ? '다크 모드' : '라이트 모드'}
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;
