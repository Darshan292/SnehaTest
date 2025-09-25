import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { 
  ArrowLeft,
  DollarSign,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

interface PaymentState {
  question: any;
  response: any;
  amount: number;
}

const PaymentPage: React.FC = () => {
  const { questionId, responderId } = useParams<{ questionId: string; responderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUserCredits } = useAuth();
  const { setFlashMessage } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentState | null>(null);

  useEffect(() => {
    // Get payment data from location state or fetch from API
    const state = location.state as PaymentState;
    if (state) {
      setPaymentData(state);
    } else {
      // If no state, redirect back to dashboard
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const handlePayment = async () => {
    if (!paymentData || !user) return;

    if (user.credits < paymentData.amount) {
      setFlashMessage({
        type: 'error',
        message: 'Insufficient credits to complete this payment.'
      });
      return;
    }

    setProcessingPayment(true);
    
    try {
      // Simulate API call for payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user credits
      const newCredits = user.credits - paymentData.amount;
      updateUserCredits(newCredits);
      
      setFlashMessage({
        type: 'success',
        message: `Payment of ${paymentData.amount} credits sent successfully to ${paymentData.response.authorUsername}!`
      });
      
      navigate(`/question/${questionId}`, { 
        state: { paymentSuccess: true } 
      });
    } catch (error) {
      setFlashMessage({
        type: 'error',
        message: 'Payment failed. Please try again.'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  const canAffordPayment = user && user.credits >= paymentData.amount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Question
          </button>
        </div>

        {/* Payment Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <CreditCard className="w-6 h-6 text-white mr-3" />
              <h1 className="text-xl font-bold text-white">
                Payment Confirmation
              </h1>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 space-y-6">
            {/* Transaction Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment to:</span>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {paymentData.response.authorUsername}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {paymentData.amount} credits
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">For question:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs truncate">
                    {paymentData.question.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Response Preview */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Response you're paying for:
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                {paymentData.response.content}
              </p>
            </div>

            {/* Current Balance */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Your Current Balance
                  </h3>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {user?.credits} credits
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    After payment:
                  </p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {(user?.credits || 0) - paymentData.amount} credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning for insufficient credits */}
            {!canAffordPayment && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Insufficient Credits
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You need {paymentData.amount - (user?.credits || 0)} more credits to complete this payment.
                      You can earn more credits by helping others with their questions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Secure Transaction
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This payment is processed securely through our internal credit system. 
                    The recipient will be notified once the transaction is complete.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={processingPayment}
              >
                Cancel Payment
              </button>
              
              <button
                onClick={handlePayment}
                disabled={processingPayment || !canAffordPayment}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processingPayment ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Payments are used to thank community members for helpful responses. 
            If you have any issues with this payment, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;