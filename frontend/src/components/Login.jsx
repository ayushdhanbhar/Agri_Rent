import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await loginUser();
    }
  };

  const loginUser = async () => {
    setLoading(true);
    setApiError('');
    console.log('Form Data:', formData);

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Login Response:', data);

      if (response.ok && data.message === 'User logged in successfully.') {
        // Use context login method
        login({
          token: data.token,
          role: data.role,
          user_id: data.user_id,
          name: data.name
        });

        setSubmitted(true);

        // Redirect based on role
        setTimeout(() => {
          if (data.role === 'farmer') {
            navigate('/farmer-dashboard');
          } else if (data.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.role === 'owner') {
            navigate('/owner-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      } else {
        setApiError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('Network error. Please check if the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light via-white to-agri-light py-12 px-4 flex items-center justify-center">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-agri-dark hover:text-agri-green transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-agri-dark to-agri-green text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-agri-light/90">Login to access your AgriRent account</p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="bg-green-50 border-l-4 border-agri-green p-4 m-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-agri-green flex-shrink-0" />
                <div>
                  <p className="font-semibold text-agri-dark">Login Successful!</p>
                  <p className="text-gray-600 text-sm">Redirecting to your dashboard...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-agri-dark mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${errors.phone
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-agri-light focus:border-agri-green'
                  }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-agri-dark mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-agri-light focus:border-agri-green'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-agri-dark rounded"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-agri-dark hover:text-agri-green transition font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || submitted}
              className={`w-full font-bold py-4 rounded-lg transition transform text-lg ${loading || submitted
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-agri-dark to-agri-green text-white hover:shadow-lg hover:scale-105'
                }`}
            >
              {loading ? 'Logging in...' : submitted ? 'Logged In!' : 'Login'}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-agri-dark font-semibold hover:text-agri-green transition"
              >
                Sign up here
              </button>
            </p>
          </form>
        </div>

        {/* Features Box */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-l-4 border-agri-accent">
          <h3 className="font-bold text-agri-dark mb-3">Quick Access</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex gap-2">✓ Browse available equipment</li>
            <li className="flex gap-2">✓ Manage your rentals</li>
            <li className="flex gap-2">✓ Track locations</li>
            <li className="flex gap-2">✓ Connect with users</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
