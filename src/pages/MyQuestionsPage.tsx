import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import apiService from '../services/api';
import { Plus, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle, Clock, MessageCircle, DollarSign, CircleAlert as AlertCircle, Search } from 'lucide-react';

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

const MyQuestionsPage: React.FC = () => {
  const { user } = useAuth();
  const { setFlashMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'solved' | 'closed'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; question: Question | null }>({
    isOpen: false,
    question: null
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserQuestions();
    }
  }, [user]);

  const fetchUserQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserQuestions(user!.id, {
        limit: 50
      });
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching user questions:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to load your questions. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          question.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [questions, searchQuery, statusFilter]);

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

  const handleDeleteQuestion = (question: Question) => {
    setDeleteModal({ isOpen: true, question });
  };

  const confirmDelete = async () => {
    if (!deleteModal.question) return;

    setActionLoading(true);
    
    try {
      await apiService.deleteQuestion(deleteModal.question._id);
      
      // Remove question from local state
      setQuestions(prev => prev.filter(q => q._id !== deleteModal.question!._id));
      
      setFlashMessage({
        type: 'success',
        message: 'Question deleted successfully!'
      });
      
    } catch (error: any) {
      console.error('Error deleting question:', error);
      setFlashMessage({
        type: 'error',
        message: error.message || 'Failed to delete question. Please try again.'
      });
    } finally {
      setActionLoading(false);
      setDeleteModal({ isOpen: false, question: null });
    }
  };

  const handleMarkSolved = async (questionId: string) => {
    setActionLoading(true);
    
    try {
      await apiService.markQuestionSolved(questionId);
      
      // Update question status in local state
      setQuestions(prev => prev.map(q => 
        q._id === questionId 
          ? { ...q, status: 'solved' as const }
          : q
      ));
      
      setFlashMessage({
        type: 'success',
        message: 'Question marked as solved!'
      });
      
    } catch (error: any) {
      console.error('Error marking question as solved:', error);
      setFlashMessage({
        type: 'error',
        message: error.message || 'Failed to mark question as solved.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusCounts = {
    all: questions.length,
    open: questions.filter(q => q.status === 'open').length,
    solved: questions.filter(q => q.status === 'solved').length,
    closed: questions.filter(q => q.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner size="lg" text="Loading your questions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all the questions you've asked
            </p>
          </div>
          <Link
            to="/add-question"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ask New Question
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statusCounts.all}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statusCounts.open}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Solved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statusCounts.solved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Credits Offered</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {questions.reduce((sum, q) => sum + q.credits, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['all', 'open', 'solved', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === status
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredQuestions.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No questions found' : 'No questions yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : "You haven't asked any questions yet. Ask your first question to get started!"
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  to="/add-question"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Your First Question
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuestions.map((question) => (
                <div key={question._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
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
                        className="block group mb-2"
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {question.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {question.description}
                        </p>
                      </Link>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
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
                          {question.responseCount || 0} responses
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {question.credits} credits
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 ml-4">
                      {question.status === 'open' && (
                        <button
                          onClick={() => handleMarkSolved(question._id)}
                          disabled={actionLoading}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as solved"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        disabled={actionLoading}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, question: null })}
        title="Delete Question"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this question?
          </p>
          {deleteModal.question && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {deleteModal.question.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {deleteModal.question.description}
              </p>
            </div>
          )}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              This action cannot be undone. All responses to this question will also be deleted.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, question: null })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={actionLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center"
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                'Delete Question'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyQuestionsPage;