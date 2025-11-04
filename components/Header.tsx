import React from 'react';
import type { User } from '../types';
import { signOutUser } from '../services/firebaseService';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await signOutUser();
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    }
  };

  return (
    <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-extrabold text-indigo-700">📚 Embed Manager</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-right">
              <span className="font-medium text-gray-800 block">Signed in as</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out shadow-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
            Not Authenticated
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
