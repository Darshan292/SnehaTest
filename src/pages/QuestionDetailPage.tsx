import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Modal from '../components/shared/Modal';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  DollarSign, 
  MessageCircle, 
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Award,
  Send
} from 'lucide-react';
import api from '../services/api';
import { Question, Response } from '../types';

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { setFlashMessage } = useApp();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const [responseCredits, setResponseCredits] = useState(0);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching question with ID:', id); // Debug log
        
        const questionData = await api.getQuestion(id);
        console.log('Received question data:', questionData); // Debug log
        
        // Check if questionData has the expected structure
        if (!questionData || !questionData.question) {
          console.error('Invalid question data structure:', questionData);
          throw new Error('Invalid question data received');
        }

        const mappedQuestion: Question = {
          id: questionData.question._id,
          title: questionData.question.title,
          description: questionData.question.description,
          credits: questionData.question.credits,
          authorId: questionData.question.author._id,
          authorUsername: questionData.question.author.username,
          responseCount: questionData.responses?.length || questionData.question.responseCount || 0,
          createdAt: new Date(questionData.question.createdAt),
          status: questionData.question.status,
          responses: questionData.responses?.map((resp: any) => ({
            id: resp._id,
            questionId: questionData.question._id,
            authorId: resp.author._id,
            authorUsername: resp.author.username,
            content: resp.content,
            credits: resp.credits,
            createdAt: new Date(resp.createdAt),
            helpful: resp.isHelpful,
            netVotes: resp.netVotes,
            totalPayments: resp.totalPayments,
          })) || [],
          tags: questionData.question.tags,
        };
        
        console.log('Mapped question:', mappedQuestion); // Debug log
        setQuestion(mappedQuestion);

        if (questionData) {
          const questionsData = await api.getQuestions(); // Renamed for clarity
          const allQuestions = questionsData.questions || questionsData || []; // Handle object or array response, fallback to []
          const filteredRelated = allQuestions.filter((q: any) => 
            q._id !== questionData.question._id && 
            (q.tags?.some((tag: string) => questionData.question.tags?.includes(tag)) || 
            q.title.toLowerCase().includes(questionData.question.title.toLowerCase().split(' ')[0]))
          ).slice(0, 3);
          const mappedRelated = filteredRelated.map((q: any) => ({
            id: q._id,
            title: q.title,
            description: q.description,
            credits: q.credits,
            authorId: q.author._id,
            authorUsername: q.author.username,
            responseCount: q.responseCount,
            createdAt: new Date(q.createdAt),
            status: q.status,
            responses: [],
            tags: q.tags,
          }));
          setRelatedQuestions(mappedRelated);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // setFlashMessage({
        //   type: 'error',
        //   message: 'Failed to load question details.'
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || !id) return;

    setSubmittingResponse(true);
    
    try {
      const responseData = {
        content: newResponse,
        questionId: id,
        credits: question.credits || 0
      };
      const newRespData = await api.createResponse(responseData);
      const newResp = newRespData.response;
      const mappedNewResp: Response = {
        id: newResp._id,
        questionId: id,
        authorId: user?.id || '',
        authorUsername: user?.username || '',
        content: newResponse,
        credits: responseCredits,
        createdAt: new Date(newResp.createdAt),
        helpful: false,
        netVotes: 0,
      };

      if (question) {
        setQuestion({
          ...question,
          responses: [...question.responses, mappedNewResp],
          // Fix: Update responseCount properly
          responseCount: question.responses.length + 1
        });
      }

      setNewResponse('');
      setResponseCredits(0);
      
      setFlashMessage({
        type: 'success',
        message: 'Your response has been posted successfully!'
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to post response.'
      });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handlePayment = (response: Response) => {
    setSelectedResponse(response);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (selectedResponse && question) {
      navigate(`/payment/${question.id}/${selectedResponse.authorId}`, {
        state: {
          question,
          response: selectedResponse,
          amount: selectedResponse.credits || 0
        }
      });
    }
    setShowPaymentModal(false);
    setSelectedResponse(null);
  };

  const markQuestionSolved = async () => {
    if (!question?.id) return;

    try {
      await api.markQuestionSolved(question.id);
      
      setQuestion({
        ...question,
        status: 'solved'
      });
      
      setFlashMessage({
        type: 'success',
        message: 'Question marked as solved!'
      });
    } catch (error) {
      console.error('Error marking question solved:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to mark question as solved.'
      });
    }
  };

  const handleMarkHelpful = async (respId: string) => {
    try {
      const updatedRespData = await api.markResponseHelpful(respId);
      const updatedResp = updatedRespData.response;
      
      if (question) {
        setQuestion({
          ...question,
          responses: question.responses.map(r => 
            r.id === respId ? { ...r, helpful: updatedResp.isHelpful } : r
          )
        });
      }
      
      setFlashMessage({
        type: 'success',
        message: 'Response marked as helpful!'
      });
    } catch (error) {
      console.error('Error marking helpful:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to mark as helpful.'
      });
    }
  };

  const handleVote = async (respId: string, type: 'upvote' | 'downvote') => {
    try {
      const voteData = await api.voteOnResponse(respId, type);
      
      if (question) {
        setQuestion({
          ...question,
          responses: question.responses.map(r => 
            r.id === respId ? { ...r, netVotes: voteData.netVotes } : r
          )
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to vote.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner size="lg" text="Loading question details..." />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Question Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The question you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const isQuestionOwner = user?.id === question.authorId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Detail */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                      {question.status === 'solved' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {question.status}
                    </span>
                    {question.tags && (
                      <div className="flex gap-2">
                        {question.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-lg font-semibold">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {question.credits} credits
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {question.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {question.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {question.authorUsername}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(question.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {question.responses.length} responses
                    </div>
                  </div>
                  
                  {isQuestionOwner && question.status === 'open' && (
                    <button
                      onClick={markQuestionSolved}
                      className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark as Solved
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Responses ({question.responses.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {question.responses.map((response) => (
                  <div key={response.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {response.authorUsername}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(response.createdAt)}
                          </div>
                        </div>
                        {response.helpful && (
                          <div className="ml-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              <Award className="w-3 h-3 mr-1" />
                              Helpful
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {response.credits && response.authorId !== user?.id && (
                        <button
                          onClick={() => handlePayment(response)}
                          className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Pay {response.credits} credits
                        </button>
                      )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {response.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleVote(response.id, 'upvote')}
                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Upvote
                      </button>
                      <button 
                        onClick={() => handleVote(response.id, 'downvote')}
                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Downvote
                      </button>
                      <span className="text-gray-500 dark:text-gray-400">
                        Net Votes: {response.netVotes || 0}
                      </span>
                      {isQuestionOwner && !response.helpful && question.status === 'open' && (
                        <button 
                          onClick={() => handleMarkHelpful(response.id)}
                          className="flex items-center text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Helpful
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {question.responses.length === 0 && (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>No responses yet. Be the first to help!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Response Form */}
            {question.status === 'open' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Your Response
                </h3>
                <form onSubmit={handleResponseSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Share your knowledge and help solve this question..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    
                    <button
                      type="submit"
                      disabled={submittingResponse || !newResponse.trim()}
                      className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {submittingResponse ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post Response
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Question Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Question Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                    {question.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {question.credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Responses:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {question.responses.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Asked by:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {question.authorUsername}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Questions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Questions
              </h3>
              <div className="space-y-3">
                {relatedQuestions.map((relatedQ) => (
                  <Link
                    key={relatedQ.id}
                    to={`/question/${relatedQ.id}`}
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {relatedQ.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{relatedQ.responseCount} responses</span>
                      <span>{relatedQ.credits} credits</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Confirm Payment"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            You are about to pay <strong>{selectedResponse?.credits} credits</strong> to{' '}
            <strong>{selectedResponse?.authorUsername}</strong> for their helpful response.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              This action cannot be undone. Make sure you found the response helpful before proceeding.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPayment}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionDetailPage;