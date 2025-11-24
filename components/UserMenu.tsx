import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  onSettingsClick?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onSettingsClick }) => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    return currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={getDisplayName()}
            className="h-8 w-8 rounded-full object-cover border-2 border-[#2a00ff]/30"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#2a00ff] to-[#a522dd] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-[#2a00ff]/20">
            {getInitials()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
            {getDisplayName()}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentUser.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onSettingsClick?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile Settings
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onSettingsClick?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </button>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
