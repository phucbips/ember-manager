import { UserButton } from './components/AuthButtons'

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email address is not whitelisted to access this application.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Whitelist Access Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This application is restricted to authorized users only. 
                    If you need access, please contact an administrator to add your email to the whitelist.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              What is Whitelist Access?
            </h4>
            <p className="text-sm text-gray-600">
              A whitelist is a list of approved email addresses that are allowed to access the application. 
              This helps maintain security and control who can use the system.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Different Email
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact your system administrator.
          </p>
        </div>
        
        <div className="mt-4 flex justify-center">
          <UserButton />
        </div>
      </div>
    </div>
  )
}