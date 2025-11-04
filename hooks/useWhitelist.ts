
import { useState, useEffect } from 'react';
import { onSnapshot, query } from 'firebase/firestore';
import { whitelistCollection } from '../services/firebaseService';

export const useWhitelist = () => {
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const q = query(whitelistCollection);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                // The email is now the document ID itself.
                const emails = snapshot.docs.map(doc => doc.id);
                setWhitelist(emails);
                setError(null);
                setIsLoading(false);
            },
            (err) => {
                console.error("Firestore listener error in useWhitelist:", err);
                setError(`Failed to load whitelist: ${err.message}`);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { whitelist, isLoading, error };
};
