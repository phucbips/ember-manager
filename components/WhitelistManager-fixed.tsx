import React, { useState } from 'react';
import { useWhitelist } from './hooks/useWhitelist';
import { formatDate } from '../utils';

interface WhitelistManagerProps {
  onNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const WhitelistManager: React.FC<WhitelistManagerProps> = ({ onNotification }) => {
  const { 
    whitelist, 
    isLoading, 
    isAdding, 
    isRemoving, 
    error, 
    clearError,
    addToWhitelist, 
    removeFromWhitelist,
    refetch,
    clearCache,
    cacheStats,
    lastUpdated
  } = useWhitelist(true);
  
  const [newEntry, setNewEntry] = useState('');
  const [entryType, setEntryType] = useState<'email' | 'domain'>('email');
  const [validationError, setValidationError] = useState('');

  // Enhanced validation with better error messages
  const validateInput = (value: string, type: 'email' | 'domain'): string | null => {
    const trimmedValue = value.trim().toLowerCase();
    
    if (!trimmedValue) {
      return 'Please enter a value.';
    }

    if (trimmedValue.length > (type === 'email' ? 254 : 253)) {
      return `${type === 'email' ? 'Email' : 'Domain'} is too long.`;
    }

    // Check for null bytes
    if (trimmedValue.includes('\0')) {
      return 'Invalid characters detected.';
    }

    // Check for consecutive dots
    if (trimmedValue.includes('..')) {
      return 'Cannot contain consecutive dots.';
    }

    if (type === 'email') {
      // Enhanced email validation
      const parts = trimmedValue.split('@');
      if (parts.length !== 2) {
        return 'Email must contain exactly one @ symbol.';
      }

      const [localPart, domainPart] = parts;
      
      if (localPart.length === 0 || domainPart.length === 0) {
        return 'Email cannot have empty parts.';
      }

      if (localPart.length > 64) {
        return 'Email local part is too long.';
      }

      if (localPart.startsWith('.') || localPart.endsWith('.')) {
        return 'Email local part cannot start or end with a dot.';
      }

      if (localPart.includes('..')) {
        return 'Email local part cannot contain consecutive dots.';
      }

      // Basic domain validation for email
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!domainRegex.test(domainPart)) {
        return 'Email domain part is invalid.';
      }

      // Final comprehensive check
      const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(trimmedValue)) {
        return 'Please enter a valid email address.';
      }
    } else {
      // Enhanced domain validation
      if (trimmedValue.startsWith('.') || trimmedValue.endsWith('.')) {
        return 'Domain cannot start or end with a dot.';
      }

      if (trimmedValue.startsWith('-') || trimmedValue.endsWith('-')) {
        return 'Domain cannot start or end with a dash.';
      }

      // Check each part
      const parts = trimmedValue.split('.');
      if (parts.length < 2) {
        return 'Domain must have at least one dot.';
      }

      for (const part of parts) {
        if (part.length === 0 || part.length > 63) {
          return 'Domain part is invalid.';
        }
        if (part.startsWith('-') || part.endsWith('-')) {
          return 'Domain part cannot start or end with a dash.';
        }
      }

      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!domainRegex.test(trimmedValue)) {
        return 'Please enter a valid domain.';
      }
    }

    return null;
  };

  // Enhanced form submission with better validation
  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const valueToAdd = newEntry.trim().toLowerCase();
    
    // Clear previous validation errors
    setValidationError('');
    
    // Validate input
    const validation = validateInput(valueToAdd, entryType);
    if (validation) {
      setValidationError(validation);
      onNotification(validation, 'error');
      return;
    }

    try {
      await addToWhitelist(valueToAdd);
      setNewEntry('');
      onNotification(`${entryType === 'email' ? 'Email' : 'Domain'} added to whitelist successfully!`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to add ${entryType} to whitelist.`;
      onNotification(errorMessage, 'error');
    }
  };

  // Real-time validation feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEntry(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Enhanced remove with better UX
  const handleRemoveEntry = async (value: string, type: 'email' | 'domain') => {
    if (!window.confirm(`Are you sure you want to remove "${value}" from the whitelist?`)) return;
    
    try {
      await removeFromWhitelist(value);
      onNotification(`${type === 'email' ? 'Email' : 'Domain'} removed from whitelist.`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to remove ${type} from whitelist.`;
      onNotification(errorMessage, 'error');
    }
  };

  // Clear cache and refresh
  const handleRefresh = () => {
    refetch();
    onNotification('Whitelist refreshed!', 'info');
  };

  // Clear cache
  const handleClearCache = () => {
    clearCache();
    onNotification('Cache cleared!', 'info');
  };

  // Error display with clear option and better accessibility
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Error loading whitelist</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label="Dismiss error message"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Accessibility announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && 'Loading whitelist entries'}
        {isAdding && `Adding ${entryType} to whitelist`}
        {isRemoving && 'Removing entry from whitelist'}
        {validationError && `Validation error: ${validationError}`}
      </div>

      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {error && `Error: ${error}`}
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">Cache Status</h4>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
                aria-label="Refresh whitelist data"
              >
                Refresh
              </button>
              <button
                onClick={handleClearCache}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Clear cache"
              >
                Clear Cache
              </button>
            </div>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>User Roles: {cacheStats.userRoles} cached</p>
            <p>Whitelist Entries: {cacheStats.whitelistEntries ? 'Cached' : 'Not cached'}</p>
            <p>Admin Checks: {cacheStats.isAdmin} cached</p>
            {lastUpdated && <p>Last updated: {formatDate(lastUpdated)}</p>}
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      <form onSubmit={handleAddEntry} className="space-y-4" noValidate>
        <div>
          <label htmlFor="newEntry" className="block text-sm font-medium text-gray-700 mb-2">
            Add to Whitelist
          </label>
          
          {/* Entry type selector */}
          <div className="flex gap-4 mb-3" role="radiogroup" aria-labelledby="entry-type-label">
            <span id="entry-type-label" className="sr-only">Entry type</span>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="email"
                checked={entryType === 'email'}
                onChange={(e) => setEntryType(e.target.value as 'email')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                aria-describedby="email-help"
              />
              <span className="ml-2 text-sm text-gray-700">Email</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="domain"
                checked={entryType === 'domain'}
                onChange={(e) => setEntryType(e.target.value as 'domain')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                aria-describedby="domain-help"
              />
              <span className="ml-2 text-sm text-gray-700">Domain</span>
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                id="newEntry"
                value={newEntry}
                onChange={handleInputChange}
                placeholder={entryType === 'email' ? 'user@example.com' : 'example.com'}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isAdding}
                aria-invalid={validationError ? 'true' : 'false'}
                aria-describedby={
                  validationError 
                    ? 'validation-error' 
                    : entryType === 'email' 
                    ? 'email-help' 
                    : 'domain-help'
                }
                aria-label={`Enter ${entryType} address to whitelist`}
              />
              {/* Help text */}
              <p id={entryType === 'email' ? 'email-help' : 'domain-help'} className="mt-2 text-xs text-gray-500">
                {entryType === 'email' 
                  ? 'Enter an email address to whitelist this user.'
                  : 'Enter a domain to whitelist this domain (e.g., example.com).'
                }
              </p>
              {/* Validation error */}
              {validationError && (
                <p id="validation-error" className="mt-1 text-xs text-red-600" role="alert">
                  {validationError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isAdding || !newEntry.trim() || !!validationError}
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Add ${entryType} to whitelist`}
            >
              {(isAdding) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add {entryType === 'email' ? 'Email' : 'Domain'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Whitelist Display */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Whitelisted Entries</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {whitelist.length} {whitelist.length === 1 ? 'entry' : 'entries'}
            </span>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              disabled={isLoading}
              aria-label="Refresh whitelist entries"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {isLoading && whitelist.length === 0 ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
            <p className="text-gray-500">Loading whitelist...</p>
          </div>
        ) : whitelist.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2" aria-hidden="true">🌐</div>
            <p className="text-gray-500">No entries have been whitelisted yet.</p>
            <p className="text-gray-400 text-sm">Add an email or domain above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto" role="list" aria-label="Whitelisted entries">
            {whitelist.map((entry) => {
              const isEmail = !!entry.email;
              const value = isEmail ? entry.email : entry.domain;
              const type = isEmail ? 'Email' : 'Domain';
              
              return (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  role="listitem"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" aria-hidden="true"></div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {value}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded" aria-label={`Type: ${type}`}>
                        {type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Added on {formatDate(entry.addedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveEntry(value!, isEmail ? 'email' : 'domain')}
                    disabled={isRemoving}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors flex-shrink-0"
                    aria-label={`Remove ${value} from whitelist`}
                  >
                    {isRemoving ? (
                      <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhitelistManager;