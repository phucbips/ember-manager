import React, { useState } from 'react';
import { addToWhitelist, removeFromWhitelist } from '../services/firebaseService';
import { useWhitelist } from '../hooks/useWhitelist';
import Spinner from './Spinner';

interface WhitelistManagerProps {
    showNotification: (message: string, type: 'success' | 'error') => void;
}

const WhitelistManager: React.FC<WhitelistManagerProps> = ({ showNotification }) => {
    const { whitelist, isLoading, error } = useWhitelist();
    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailToAdd = newEmail.trim().toLowerCase();
        if (!emailToAdd || !/^\S+@\S+\.\S+$/.test(emailToAdd)) {
            showNotification("Please enter a valid email address.", 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await addToWhitelist(emailToAdd);
            setNewEmail('');
            showNotification("Email added to whitelist successfully!", 'success');
        } catch (err) {
            const error = err as Error;
            console.error("Failed to add email:", error);
            showNotification(error.message || "Failed to add email to whitelist.", 'error');
        }
        setIsSubmitting(false);
    };

    const handleRemoveEmail = async (emailToRemove: string) => {
        if (!window.confirm(`Are you sure you want to remove ${emailToRemove} from the whitelist?`)) return;
        
        try {
            await removeFromWhitelist(emailToRemove);
            showNotification("Email removed from whitelist.", 'success');
        } catch (err) {
            const error = err as Error;
            console.error("Failed to remove email:", error);
            showNotification(error.message || "Failed to remove email from whitelist.", 'error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Whitelist Management</h2>
            <form onSubmit={handleAddEmail} className="flex items-center gap-4 mb-6">
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter user email to add"
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                    disabled={isSubmitting}
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newEmail.trim()}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </button>
            </form>

            <h3 className="text-lg font-medium text-gray-700 mb-3">Whitelisted Users:</h3>
            {error && <p className="text-red-500">{error}</p>}
            {isLoading ? <Spinner /> : (
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {whitelist.length > 0 ? [...whitelist].sort().map(email => (
                        <div key={email} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                            <span className="text-gray-800 text-sm break-all">{email}</span>
                            <button 
                                onClick={() => handleRemoveEmail(email)}
                                className="text-red-500 hover:text-red-700 font-semibold text-sm ml-4 flex-shrink-0"
                            >
                                Remove
                            </button>
                        </div>
                    )) : <p className="text-gray-500">No users have been added to the whitelist yet.</p>}
                 </div>
            )}
        </div>
    );
};

export default WhitelistManager;