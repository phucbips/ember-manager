import React, { useEffect, useState } from 'react';

interface PreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ url, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleBackdropClick);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleBackdropClick);
    };
  }, [onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <h3 
              className="text-xl font-semibold text-gray-900 truncate" 
              title={title}
            >
              Preview: {title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 bg-gray-50 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading content...</p>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">⚠️</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Unable to load content
                </h4>
                <p className="text-gray-600 mb-4">
                  The content could not be loaded. This might be due to:
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-1 mb-6">
                  <li>• Network connection issues</li>
                  <li>• Content blocked by the source</li>
                  <li>• Invalid or expired URL</li>
                </ul>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              src={url}
              title={title}
              className="w-full h-full border-0 rounded-lg shadow-sm bg-white" 
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Status: {isLoading ? 'Loading...' : hasError ? 'Error' : 'Ready'}</span>
              <span>•</span>
              <span className="truncate max-w-md" title={url}>
                URL: {url.length > 50 ? `${url.substring(0, 50)}...` : url}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Esc to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;