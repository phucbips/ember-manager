import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isUserWhitelisted } from './services/firebaseService';

import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import Spinner from './components/Spinner';

const ADMIN_EMAIL = 'thanhphucn06@gmail.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isWhitelisted, setWhitelisted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const adminCheck = currentUser.email === ADMIN_EMAIL;
        setIsAdmin(adminCheck);

        if (!adminCheck && currentUser.email) {
            try {
                const whitelistCheck = await isUserWhitelisted(currentUser.email);
                setWhitelisted(whitelistCheck);
            } catch (error) {
                console.error("Error checking whitelist status:", error);
                setWhitelisted(false);
            }
        } else {
            // Admin is not a "whitelisted user" in the user context
            setWhitelisted(false); 
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        setWhitelisted(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (isAdmin) {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} isWhitelisted={isWhitelisted} />;
};

export default App;
