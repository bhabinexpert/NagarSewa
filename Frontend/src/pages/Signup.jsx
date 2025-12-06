import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  FileText,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

// Simple component to show password requirements
const PasswordRequirement = ({ met, text }) => (
  <div className={`text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
    {text}
  </div>
);

export default function Signup() {
  // Form data state - stores all user inputs
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Toggle visibility for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength based on length
  const getPasswordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return { score: 0, message: "" };
    if (length < 3) return { score: 1, message: "Weak" };
    if (length < 5) return { score: 2, message: "Medium" };
    if (length < 8) return { score: 3, message: "Good" };
    return { score: 4, message: "Strong" };
  };

  // Get color for strength indicator bar
  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-600";
    if (score === 2) return "bg-yellow-600";
    if (score === 3) return "bg-blue-600";
    return "bg-green-600";
  };

  // Check if passwords match
  const passwordsMatch = formData.password === formData.confirmPassword;

  // Check individual password requirements
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle terms acceptance
  const toggleTerms = () => {
    setFormData({ ...formData, acceptTerms: !formData.acceptTerms });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName) {
      alert("Please enter your full name");
      return;
    }
    if (!formData.email) {
      alert("Please enter your email");
      return;
    }
    if (!formData.password) {
      alert("Please enter a password");
      return;
    }
    if (!passwordsMatch) {
      alert("Passwords do not match");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    // Submit the form
    console.log("Form submitted:", formData);
    alert("Account created successfully!");
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800">
      <div className="h-full w-full flex flex-col max-w-6xl mx-auto px-4 py-4">
        
        {/* Header Section */}
        <div className="text-center mb-3 flex-shrink-0">
          <div className="inline-flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left m-5">
              <h1 className="text-xl font-bold text-white leading-tight">
                NagarSewa
              </h1>
              <p className="text-white/80 text-xs">
                Create Your Digital Citizen Account
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-10 overflow-hidden min-h-0">
          
          {/* Main Signup Form */}
          <div className="lg:w-2/3 flex flex-col min-h-0 mr-3 p-3">
            <div className="bg-white rounded-2xl shadow-md flex flex-col h-full overflow-hidden">
              
              {/* Form Header */}
              <div className="bg-linear-to-r from-blue-600 to-teal-600 p-3 text-white shrink-0">
                <div className="flex items-center justify-center gap-4 p-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Create Your Account</h2>
                    <p className="text-white/90 text-xs">
                      Join thousands of citizens using digital services
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-3">
                  
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Full Name Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <User className="inline w-3 h-3 mr-1 text-gray-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="As per citizenship certificate"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Mail className="inline w-3 h-3 mr-1 text-gray-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="citizen@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Lock className="inline w-3 h-3 mr-1 text-gray-400" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Create a strong password"
                        />
                        {/* Toggle password visibility button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator - Only show if password has content */}
                      {formData.password && (
                        <div className="mt-2">
                          {/* Strength label and score */}
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Strength:</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score <= 1 ? "text-red-600" :
                              passwordStrength.score === 2 ? "text-yellow-600" :
                              passwordStrength.score === 3 ? "text-blue-600" :
                              "text-green-600"
                            }`}>
                              {passwordStrength.message}
                            </span>
                          </div>
                          
                          {/* Strength bars */}
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map((barNumber) => (
                              <div
                                key={barNumber}
                                className={`h-1 rounded-full flex-1 ${
                                  barNumber <= passwordStrength.score
                                    ? getStrengthColor(passwordStrength.score)
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Password requirements checklist */}
                          <div className="grid grid-cols-2 gap-1">
                            <PasswordRequirement met={hasMinLength} text="8+ characters" />
                            <PasswordRequirement met={hasUppercase} text="Uppercase" />
                            <PasswordRequirement met={hasLowercase} text="Lowercase" />
                            <PasswordRequirement met={hasNumber} text="Number" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Lock className="inline w-3 h-3 mr-1 text-gray-400" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Re-enter your password"
                        />
                        {/* Toggle confirm password visibility button */}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password match indicator - Only show if both passwords have content */}
                      {formData.password && formData.confirmPassword && (
                        <div className={`mt-2 text-xs flex items-center ${
                          passwordsMatch ? "text-green-600" : "text-red-600"
                        }`}>
                          {passwordsMatch ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={toggleTerms}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        formData.acceptTerms
                          ? "bg-teal-600 border-teal-600"
                          : "border-gray-300 hover:border-teal-500"
                      }`}
                    >
                      {formData.acceptTerms && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <label className="text-xs text-gray-600 cursor-pointer" onClick={toggleTerms}>
                      I accept the{" "}
                      <span className="text-blue-600 font-medium hover:text-blue-800">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 font-medium hover:text-blue-800">
                        Privacy Policy
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    Create Account
                  </button>

                  {/* Login Link */}
                  <div className="text-center pt-1">
                    <p className="text-gray-600 text-xs">
                      Already have an account?{" "}
                      <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer">
                        <Link to = '/login'>Login In</Link>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section - Desktop Only */}
          <div className="hidden lg:flex lg:w-1/3 flex-col min-h-0 m-3 p-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex flex-col overflow-hidden">
              
              {/* Benefits Header */}
              <div className="text-white mb-3 flex-shrink-0">
                <ShieldCheck className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-bold mb-2">Why Join NagarSewa?</h3>
                <p className="text-white/80 text-xs">
                  Get notices of social offers and trainings.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                {/* Benefit 1 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      Smart Issue Reporting
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      Track progress smartly
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      Service Requests
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      Appeal for services and events
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      Notifications
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      Important municipal updates
                    </p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      24/7 Support
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      Government-certified assistance
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-3 pt-3 border-t border-white/20 flex-shrink-0">
                <p className="text-white/60 text-xs">
                  <ShieldCheck className="inline w-3 h-3 mr-1" />
                  Government verified & secure platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-3 text-center flex-shrink-0">
          <div className="flex flex-wrap justify-center gap-2 text-xs text-white/80">
            <span className="hover:text-white transition-colors cursor-pointer">
              Help Center
            </span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              FAQ
            </span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Contact Support
            </span>
          </div>
          <p className="text-white/60 text-xs mt-1">© 2023 NagarSewa</p>
        </footer>
      </div>
    </div>
  );
}