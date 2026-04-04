import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import apiService from '../services/api';
import { User, Award, MessageCircle, DollarSign, CreditCard as Edit3, Save, X, TrendingUp, CircleCheck as CheckCircle, Clock } from 'lucide-react';

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
}

interface UserProfile {
  user: any;
  recentQuestions: any[];
  recentResponses: any[];
}

interface Achievement {
  name: string;
  description: string;
  earned: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { setFlashMessage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    bio: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserProfile();
      setProfileData(data);
      
      // Update form data with fetched profile
      setFormData({
        username: data.user.username || '',
        email: data.user.email || '',
        bio: data.user.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to load profile data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      await apiService.updateUserProfile(formData);
      
      // Refresh user data
      await refreshUser();
      
      // Refresh profile data
      await fetchProfileData();
      
      setFlashMessage({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setFlashMessage({
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        username: profileData.user.username || '',
        email: profileData.user.email || '',
        bio: profileData.user.bio || ''
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const achievements: Achievement[] = [
    {
      icon: MessageCircle,
      name: 'First Question',
      description: 'Asked your first question',
      earned: (user?.questionsAsked || 0) > 0,
      color: 'text-blue-500'
    },
    {
      icon: CheckCircle,
      name: 'Problem Solver',
      description: 'Had a question marked as solved',
      earned: profileData?.recentQuestions.some(q => q.status === 'solved') || false,
      color: 'text-green-500'
    },
    {
      icon: Award,
      name: 'Helpful Mentor',
      description: 'Provided 5+ helpful responses',
      earned: (user?.doubtsResolved || 0) >= 5,
      color: 'text-purple-500'
    },
    {
      icon: DollarSign,
      name: 'Credit Collector',
      description: 'Earned 100+ credits',
      earned: (user?.credits || 0) >= 100,
      color: 'text-yellow-500'
    }
  ];

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center -mt-10 border-4 border-white dark:border-gray-800">
                  <User className="w-10 h-10 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Member since {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.username ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user?.username}</p>
                  )}
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user?.email}</p>
                  )}
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      {formData.bio || 'No bio provided yet.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              
              {profileData && (profileData.recentQuestions.length > 0 || profileData.recentResponses.length > 0) ? (
                <div className="space-y-4">
                  {/* Recent Questions */}
                  {profileData.recentQuestions.map((question) => (
                    <div key={question._id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Asked: {question.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(new Date(question.createdAt))}
                          </p>
                          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {question.credits} credits
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Recent Responses */}
                  {profileData.recentResponses.map((response) => (
                    <div key={response._id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Answered: {response.question?.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(new Date(response.createdAt))}
                          </p>
                          {response.isHelpful && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              <Award className="w-3 h-3 mr-1" />
                              Helpful
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity. Start asking questions or helping others!
                </p>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Achievements
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      achievement.earned
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <achievement.icon 
                        className={`w-6 h-6 mt-0.5 ${achievement.earned ? achievement.color : 'text-gray-400'}`} 
                      />
                      <div>
                        <h3 className={`text-sm font-medium ${
                          achievement.earned 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-xs mt-1 ${
                          achievement.earned 
                            ? 'text-gray-600 dark:text-gray-300' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Earned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Credits</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.credits}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Questions</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.questionsAsked}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Doubts Resolved</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.doubtsResolved}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <a
                  href="/add-question"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Ask a Question
                </a>
                <a
                  href="/my-questions"
                  className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-center font-medium transition-colors"
                >
                  My Questions
                </a>
                <a
                  href="/leaderboard"
                  className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-center font-medium transition-colors"
                >
                  View Leaderboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;