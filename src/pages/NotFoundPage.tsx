import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</div>
            <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              {isAuthenticated ? 'Back to Dashboard' : 'Go to Homepage'}
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors w-full justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Help Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Need help finding what you're looking for?
            </p>
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Questions
              </Link>
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                  >
                    Sign In to Your Account
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                  >
                    Create New Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
              💡 Did you know?
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Our community has helped solve over 10,000 questions! 
              Join us and start learning together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;