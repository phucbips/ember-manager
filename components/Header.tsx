import React from 'react';
import { UserButton } from './AuthButtons';
import { useAuth } from './hooks/useAuth';

const Header: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-indigo-700">📚 Embed Manager</h1>
        <div className="text-gray-500">Loading...</div>
      </header>
    );
  }

  return (
    <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-extrabold text-indigo-700">📚 Embed Manager</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-right">
              <span className="font-medium text-gray-800 block">Signed in as</span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <UserButton />
          </div>
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