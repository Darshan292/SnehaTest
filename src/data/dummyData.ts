export interface Question {
  id: string;
  title: string;
  description: string;
  credits: number;
  authorId: string;
  authorUsername: string;
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

export const dummyQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement useEffect cleanup properly?',
    description: 'I\'m having trouble with useEffect cleanup functions in React. My components seem to have memory leaks and I\'m not sure how to properly clean up event listeners and subscriptions.',
    credits: 50,
    authorId: '1',
    authorUsername: 'john_dev',
    createdAt: new Date(Date.now() - 2 * 60 * 60000),
    status: 'open',
    responses: [
      {
        id: '1',
        questionId: '1',
        authorId: '2',
        authorUsername: 'sarah_mentor',
        content: 'You need to return a cleanup function from useEffect. Here\'s how you can properly clean up event listeners: useEffect(() => { const handleResize = () => {}; window.addEventListener(\'resize\', handleResize); return () => window.removeEventListener(\'resize\', handleResize); }, []);',
        credits: 30,
        createdAt: new Date(Date.now() - 1 * 60 * 60000),
        helpful: true,
      }
    ],
    tags: ['React', 'useEffect', 'JavaScript'],
  },
  {
    id: '2',
    title: 'Best practices for Redux state management',
    description: 'I\'m working on a large React application and considering Redux for state management. What are the current best practices for structuring Redux stores and handling async actions?',
    credits: 75,
    authorId: '3',
    authorUsername: 'alex_coder',
    createdAt: new Date(Date.now() - 4 * 60 * 60000),
    status: 'open',
    responses: [],
    tags: ['Redux', 'State Management', 'React'],
  },
  {
    id: '3',
    title: 'TypeScript generics with React components',
    description: 'How can I create reusable React components with TypeScript generics? I want to build a data table component that can work with different data types.',
    credits: 60,
    authorId: '1',
    authorUsername: 'john_dev',
    createdAt: new Date(Date.now() - 6 * 60 * 60000),
    status: 'solved',
    responses: [
      {
        id: '2',
        questionId: '3',
        authorId: '2',
        authorUsername: 'sarah_mentor',
        content: 'You can use generic props like this: interface TableProps<T> { data: T[]; columns: Column<T>[]; } function Table<T>({ data, columns }: TableProps<T>) { /* implementation */ }',
        credits: 40,
        createdAt: new Date(Date.now() - 5 * 60 * 60000),
        helpful: true,
      }
    ],
    tags: ['TypeScript', 'React', 'Generics'],
  },
  {
    id: '4',
    title: 'Optimizing React app performance',
    description: 'My React application is getting slow with large lists. What are the best techniques for optimizing performance? Should I use React.memo, useMemo, or something else?',
    credits: 80,
    authorId: '3',
    authorUsername: 'alex_coder',
    createdAt: new Date(Date.now() - 8 * 60 * 60000),
    status: 'open',
    responses: [],
    tags: ['React', 'Performance', 'Optimization'],
  },
  {
    id: '5',
    title: 'Node.js Express middleware patterns',
    description: 'I\'m building a REST API with Express.js and want to understand middleware patterns better. How should I structure authentication, validation, and error handling middleware?',
    credits: 65,
    authorId: '1',
    authorUsername: 'john_dev',
    createdAt: new Date(Date.now() - 12 * 60 * 60000),
    status: 'open',
    responses: [
      {
        id: '3',
        questionId: '5',
        authorId: '2',
        authorUsername: 'sarah_mentor',
        content: 'For authentication middleware, create a separate auth.js file and use it like: const auth = (req, res, next) => { /* verify token */ }; app.use(\'/api/protected\', auth);',
        credits: 25,
        createdAt: new Date(Date.now() - 10 * 60 * 60000),
        helpful: true,
      }
    ],
    tags: ['Node.js', 'Express', 'API'],
  },
];

export const leaderboardData: LeaderboardUser[] = [
  {
    id: '2',
    username: 'sarah_mentor',
    credits: 1250,
    questionsAsked: 12,
    doubtsResolved: 89,
    rank: 1,
  },
  {
    id: '4',
    username: 'dev_master',
    credits: 980,
    questionsAsked: 8,
    doubtsResolved: 76,
    rank: 2,
  },
  {
    id: '5',
    username: 'code_ninja',
    credits: 850,
    questionsAsked: 15,
    doubtsResolved: 62,
    rank: 3,
  },
  {
    id: '6',
    username: 'react_guru',
    credits: 720,
    questionsAsked: 20,
    doubtsResolved: 48,
    rank: 4,
  },
  {
    id: '1',
    username: 'john_dev',
    credits: 650,
    questionsAsked: 25,
    doubtsResolved: 35,
    rank: 5,
  },
  {
    id: '3',
    username: 'alex_coder',
    credits: 520,
    questionsAsked: 30,
    doubtsResolved: 28,
    rank: 6,
  },
];