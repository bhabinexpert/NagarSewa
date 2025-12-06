import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Globe,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  // Form data state - stores email, password, and remember me checkbox
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading state for form submission
  const [isLoading, setIsLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState('');

  // Handle input changes for text fields and checkboxes
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    // For checkboxes use 'checked', for other inputs use 'value'
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue
    });
    
    // Clear error when user starts typing
    setError('');
  };

  // Handle form submission
  const handleSubmit = () => {
    // Check if email and password are filled
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with timeout (replace with real API in production)
    setTimeout(() => {
      console.log('Login successful:', formData.email);
      alert('Login successful! Redirecting to dashboard...');
      
      // In real app, you would:
      // 1. Send login request to backend
      // 2. Store authentication token
      // 3. Redirect to dashboard
      
      setIsLoading(false);
    }, 1500);
  };


  // Handle Enter key press on inputs
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo and Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NagarSewa</h1>
          <p className="text-white/80 text-base">Digital Public Service Platform</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          
          {/* Card Header with Gradient Background */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-white/90 text-sm mt-1">Sign in to access your citizen account</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            
            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Email Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="citizen@example.com"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2 text-gray-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  {/* Toggle password visibility button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
              {/* Create Account Link */}
              <div className="text-center pt-2">
                <p className="text-gray-600 text-base">
                  Don't have an account?{' '}
                  <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
                    Create Account
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="hover:text-white transition-colors cursor-pointer px-2">
              Services
            </span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white transition-colors cursor-pointer px-2">
              About
            </span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white transition-colors cursor-pointer px-2">
              Contact
            </span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white transition-colors cursor-pointer px-2">
              Privacy
            </span>
          </div>
          <p className="text-white/60 text-xs mt-4">
            © 2023 NagarSewa - Digital Public Service Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;