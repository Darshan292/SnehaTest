import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Circle as HelpCircle, DollarSign, Tag } from 'lucide-react';

const AddQuestionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    credits: 25,
    tags: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { setFlashMessage } = useApp();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (formData.credits < 5) {
      newErrors.credits = 'Minimum credits is 5';
    } else if (formData.credits > (user?.credits || 0)) {
      newErrors.credits = `You only have ${user?.credits} credits available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const questionData = {
        title: formData.title,
        description: formData.description,
        credits: formData.credits,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await apiService.createQuestion(questionData);
      
      setFlashMessage({
        type: 'success',
        message: 'Your question has been posted successfully! The community will help you soon.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      setFlashMessage({
        type: 'error',
        message: error.message || 'Failed to post question. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedCredits = [10, 25, 50, 75, 100];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ask a Question
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Get help from the community by asking a detailed question
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., How to optimize React component performance?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Be specific and clear about what you need help with
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical ${
                  errors.description 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Explain your problem in detail. Include:
- What you've tried so far
- Expected vs actual results  
- Relevant code snippets
- Error messages if any"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
              <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Provide as much context as possible</span>
                <span>{formData.description.length} characters</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="react, javascript, typescript, node.js"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add relevant tags separated by commas (optional)
              </p>
            </div>

            {/* Credits */}
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credits to Offer *
              </label>
              <div className="flex items-center space-x-4 mb-3">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    id="credits"
                    name="credits"
                    min="5"
                    max={user?.credits || 0}
                    value={formData.credits}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.credits 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Available: {user?.credits || 0} credits
                </div>
              </div>

              {/* Suggested Credits */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quick select:</span>
                {suggestedCredits.map(credit => (
                  <button
                    key={credit}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, credits: credit }))}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.credits === credit
                        ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    disabled={credit > (user?.credits || 0)}
                  >
                    {credit}
                  </button>
                ))}
              </div>

              {errors.credits && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.credits}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Higher credits typically get faster responses
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                📝 Question Guidelines
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Be specific and clear about your problem</li>
                <li>• Include relevant code snippets or examples</li>
                <li>• Mention what you've already tried</li>
                <li>• Use proper formatting for code blocks</li>
                <li>• Be respectful and patient with responders</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Posting...</span>
                  </>
                ) : (
                  'Post Question'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionPage;