import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import land from '../images/landing.png'; // put your image in public/images/
import { 
  HelpCircle, 
  Users, 
  Award, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Zap,
  Heart
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: HelpCircle,
      title: 'Ask Questions',
      description: 'Get help from the community by asking detailed questions and offering credits as incentive.',
    },
    {
      icon: Users,
      title: 'Mentor Others',
      description: 'Share your knowledge and help fellow learners while earning credits and building reputation.',
    },
    {
      icon: Award,
      title: 'Earn Credits',
      description: 'Get rewarded for providing helpful answers and contributing to the learning community.',
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'Compete with others and climb the rankings based on your contributions and helpfulness.',
    },
  ];

  const benefits = [
    'Connect with like-minded learners',
    'Get answers from experienced developers',
    'Build your reputation in the community',
    'Earn credits for helping others',
    'Access to premium features and content',
    'Real-time notifications and updates',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Solve doubts, earn credits,
              <span className="text-blue-600 block">grow together.</span>
            </h1>
            <img
              src={land}
              alt="Four friends learning together"
              className="w-80 object-contain  dark:bg-gray-800 mx-auto mb-4"
            />
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join the ultimate peer-to-peer learning platform where knowledge sharing is rewarded 
              and every question leads to growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors shadow-lg"
            >
              Explore Platform
            </Link>
          </div>
          

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-400">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Credits Earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How LearnHub Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform makes learning collaborative, rewarding, and effective for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose LearnHub?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Experience the future of peer-to-peer learning with our innovative credit-based system 
                that rewards knowledge sharing and creates a thriving community.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Quick Response
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get answers in minutes
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    "How to optimize React performance?"
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Posted 2 min ago</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">50 credits</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Join other learners helping each other grow
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are growing together on LearnHub.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 text-lg font-semibold rounded-lg transition-colors shadow-lg"
          >
            Sign Up Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;