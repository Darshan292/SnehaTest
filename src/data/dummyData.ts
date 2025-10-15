// This file is now deprecated - all data comes from the MongoDB backend
// Keeping for reference only

export interface Question {
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

export interface Response {
  _id: string;
  content: string;
  question: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  credits: number;
  upvotes: Array<{ user: string; createdAt: Date }>;
  downvotes: Array<{ user: string; createdAt: Date }>;
  isHelpful: boolean;
  createdAt: string;
  updatedAt: string;
  netVotes: number;
}

export interface LeaderboardUser {
  _id: string;
  username: string;
  credits: number;
  questionsAsked: number;
  doubtsResolved: number;
  rank: number;
  avatar?: string;
}

// All data is now fetched from the backend APIs
// These interfaces are kept for TypeScript type definitions