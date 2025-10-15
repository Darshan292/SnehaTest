import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import apiService from '../services/api';
import { Trophy, Medal, Award, User, TrendingUp, Calendar, ListFilter as Filter, Crown, Star } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar?: string;
  credits: number;
  questionsAsked: number;
  doubtsResolved: number;
  rank: number;
}

interface LeaderboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalResponses: number;
  totalCreditsCirculated: number;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { setFlashMessage } = useApp();
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [sortBy, setSortBy] = useState<'credits' | 'questions' | 'resolved'>('credits');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [timeFilter, sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLeaderboard({
        period: timeFilter,
        sortBy,
        limit: 50
      });
      
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.currentUserRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to load leaderboard. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getLeaderboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-semibold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Celebrating our top contributors who make the learning community thrive
          </p>
          {currentUserRank && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
              <Star className="w-4 h-4 mr-2" />
              You're ranked #{currentUserRank}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
              <div className="text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalQuestions}</div>
              <div className="text-gray-600 dark:text-gray-400">Questions Asked</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalResponses}</div>
              <div className="text-gray-600 dark:text-gray-400">Responses Given</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalCreditsCirculated}</div>
              <div className="text-gray-600 dark:text-gray-400">Credits in Circulation</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Time Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['weekly', 'monthly', 'all-time'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeFilter === period
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period === 'all-time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'credits' | 'questions' | 'resolved')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="credits">Sort by Credits</option>
              <option value="questions">Sort by Questions Asked</option>
              <option value="resolved">Sort by Doubts Resolved</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topThree.map((leader, index) => {
              const actualRank = index + 1;
              const isCurrentUser = leader._id === user?.id;
              
              return (
                <div
                  key={leader._id}
                  className={`relative ${
                    actualRank === 1 ? 'md:order-2' : actualRank === 2 ? 'md:order-1' : 'md:order-3'
                  } ${actualRank === 1 ? 'transform md:-translate-y-4' : ''}`}
                >
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-4 ${
                    actualRank === 1 
                      ? 'border-yellow-400' 
                      : actualRank === 2 
                      ? 'border-gray-400' 
                      : 'border-amber-400'
                  } ${isCurrentUser ? 'ring-4 ring-blue-400' : ''}`}>
                    {/* Rank Badge */}
                    <div className={`text-center py-4 ${getRankBadgeColor(actualRank)}`}>
                      <div className="flex items-center justify-center mb-2">
                        {getRankIcon(actualRank)}
                      </div>
                      <div className="text-2xl font-bold">#{actualRank}</div>
                    </div>

                    {/* User Info */}
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {leader.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span>
                        )}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                          <Trophy className="w-4 h-4 mr-2" />
                          <span className="font-semibold">{leader.credits} credits</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {leader.questionsAsked} questions • {leader.doubtsResolved} resolved
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Remaining Rankings */}
        {remaining.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Full Rankings
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {remaining.map((leader) => {
                const isCurrentUser = leader._id === user?.id;
                
                return (
                  <div
                    key={leader._id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {leader.rank}
                          </span>
                        </div>
                        
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {leader.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rank #{leader.rank}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8 text-sm">
                        <div className="text-center">
                          <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                            <Trophy className="w-4 h-4 mr-1" />
                            {leader.credits}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Credits</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {leader.questionsAsked}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Questions</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {leader.doubtsResolved}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">Resolved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leaderboard.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No leaderboard data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to ask questions and help others to appear on the leaderboard!
            </p>
          </div>
        )}

        {/* Achievement Explanation */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How Rankings Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Earn Credits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help others by providing quality answers to their questions
                </p>
              </div>
              <div className="text-center">
                <Medal className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Stay Active</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask thoughtful questions and engage with the community
                </p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Build Reputation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consistently provide helpful and accurate solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;