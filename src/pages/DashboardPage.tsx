import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import FlashMessage from '../components/shared/FlashMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import apiService from '../services/api';
import dashboard from '../images/Dashboard.png'
import recenquestionsImage from '../images/Recentque.png';
import { Plus, Clock, DollarSign, User, CircleCheck as CheckCircle, CircleAlert as AlertCircle, TrendingUp, MessageCircle } from 'lucide-react';

interface Question {
  _id: string;
  title: string;
  description: string;
  credits: number;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  status: 'open' | 'solved' | 'closed';
  tags: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { setFlashMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'solved' | 'closed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'credits' | 'popular'>('newest');

  useEffect(() => {
    fetchQuestions();
  }, [statusFilter, sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        limit: 20
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const data = await apiService.getQuestions(params);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to load questions. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(question =>
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [questions, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FlashMessage />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Header */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm px-6 py-2 mb-6">
              <div className="flex items-start justify-between ">
                {/* Left side: Text content */}
                <div className="flex-1 my-auto">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">
                    Welcome back, {user?.username}! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ready to help others learn or ask your next question?
                  </p>
                </div>

                {/* Right side: Image */}
                <div className="flex-shrink-0">
                  <img
                    src={dashboard} // Replace with your actual image URL
                    alt="Welcome illustration"
                    className="w-full h-44 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Credits</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {user?.credits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions Asked</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {user?.questionsAsked}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Doubts Resolved</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {user?.doubtsResolved}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Questions</option>
                    <option value="open">Open</option>
                    <option value="solved">Solved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="credits">Highest Credits</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions List */}
           <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  
                  {/* Left: Text */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Recent Questions
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {filteredQuestions.length} questions found
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>

                  {/* Right: Image - pushed to edge */}
                  <div className="flex-shrink-0 mr-auto">
                    <img
                      src={recenquestionsImage} // your imported image
                      alt="Recent questions"
                      className="w-full h-24 object-contain"
                    />
                  </div>
                </div>

              {loading ? (
                <LoadingSpinner size="md" text="Loading questions..." />
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredQuestions.map((question) => (
                    <div key={question._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(question.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                              {question.status}
                            </span>
                            {question.tags && (
                              <div className="flex gap-1">
                                {question.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <Link 
                            to={`/question/${question._id}`}
                            className="block group"
                          >
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {question.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {question.description}
                            </p>
                          </Link>

                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3 space-x-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {question.author.username}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).format(new Date(question.createdAt))}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {question.responseCount || 0} answers
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end ml-4">
                          <div className="flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {question.credits} credits
                          </div>
                          <Link
                            to={`/question/${question._id}`}
                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            View & Answer
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredQuestions.length === 0 && !loading && (
                    <div className="p-6 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? (
                          <>
                            <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No questions found</h3>
                            <p>No questions match your search for "{searchQuery}"</p>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                            <p>Be the first to ask a question!</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/add-question"
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ask a Question
                </Link>
                <Link
                  to="/my-questions"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  My Questions
                </Link>
                <Link
                  to="/leaderboard"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Your question about React hooks was solved
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      You earned 25 credits for helping with JavaScript
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      New answer to your TypeScript question
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 Pro Tips
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Offer more credits for complex questions</li>
                <li>• Be specific in your question descriptions</li>
                <li>• Thank helpful mentors with credits</li>
                <li>• Check the leaderboard for top contributors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;