export interface Question {
  id: string;
  title: string;
  description: string;
  credits: number;
  authorId: string;
  authorUsername: string;
  responseCount: number;
  createdAt: Date;
  status: 'open' | 'solved' | 'closed';
  responses: Response[];
  tags?: string[];
}

export interface Response {
  id: string;
  questionId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  credits?: number;
  createdAt: Date;
  helpful: boolean;
  netVotes?: number;
  totalPayments?: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  credits: number;
  questionsAsked: number;
  doubtsResolved: number;
  rank: number;
  avatar?: string;
}