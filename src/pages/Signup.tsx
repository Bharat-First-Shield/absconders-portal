import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Shield, Sun, Moon, Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/auth';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  policeStation?: string;
  role: 'admin' | 'investigator' | 'public';
  district?: string;
  state?: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  policeStation?: string;
  role?: string;
  district?: string;
  state?: string;
}

export function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    policeStation: '',
    role: 'public'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password strength calculation
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'None', color: 'bg-gray-200 dark:bg-gray-700' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Map score to label and color
    const strengthMap = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 4, label: 'Medium', color: 'bg-yellow-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' },
      { score: 6, label: 'Very Strong', color: 'bg-green-600' }
    ];
    
    const strength = strengthMap.reduce((prev, curr) => 
      score >= curr.score ? curr : prev
    );
    
    return { 
      score: Math.min(score, 6), 
      label: strength.label, 
      color: strength.color 
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'username':
        return !value.trim() ? 'Username is required' : 
               value.length < 3 ? 'Username must be at least 3 characters' : undefined;
      
      case 'firstName':
        return !value.trim() ? 'First name is required' : undefined;
      
      case 'lastName':
        return !value.trim() ? 'Last name is required' : undefined;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : undefined;
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;
      
      case 'policeStation':
        if (formData.role === 'investigator' && !value?.trim()) {
          return 'Police station is required for investigators';
        }
        return undefined;
      
      case 'district':
        if (formData.role === 'investigator' && !value?.trim()) {
          return 'District is required for investigators';
        }
        return undefined;
        
      case 'state':
        if (formData.role === 'investigator' && !value?.trim()) {
          return 'State is required for investigators';
        }
        return undefined;
      
      case 'role':
        return !value ? 'Role is required' : undefined;
      
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name as keyof FormData, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key as keyof FormData, value as string);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });
    
    // Additional validation for investigators
    if (formData.role === 'investigator') {
      if (!formData.district) {
        newErrors.district = 'District is required for investigators';
        isValid = false;
      }
      if (!formData.state) {
        newErrors.state = 'State is required for investigators';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare registration data
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        policeStation: formData.policeStation,
        district: formData.district,
        state: formData.state
      };
      
      // Call the register API
      const response = await register(registrationData);
      
      // Log the user in with the returned token
      login(response.token);
      
      toast.success('Account created successfully!');
      
      // Redirect to dashboard
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error instanceof Error ? error.message : 'Registration failed');
      toast.error(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordCriteria = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains a number', met: /[0-9]/.test(formData.password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full relative"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </motion.button>

        <div className="flex justify-center mb-6">
          <Shield className="w-12 h-12 text-primary-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          Create Account
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Join the Absconders Portal
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.firstName && touched.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="First name"
                  required
                />
                {touched.firstName && errors.firstName && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.firstName && errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.lastName && touched.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Last name"
                  required
                />
                {touched.lastName && errors.lastName && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.lastName && errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.username && touched.username
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                placeholder="Choose a username"
                required
              />
              {touched.username && errors.username && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {touched.username && errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.email && touched.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                placeholder="Enter your email address"
                required
              />
              {touched.email && errors.email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                  errors.password && touched.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                placeholder="Create a password"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Password strength: {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`} 
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
                
                {/* Password criteria list */}
                <div className="mt-2 space-y-1">
                  {passwordCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-center text-xs">
                      {criterion.met ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={criterion.met ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}>
                        {criterion.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.role && touched.role
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
              } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
              required
            >
              <option value="public">Public User</option>
              <option value="investigator">Investigator</option>
              <option value="admin">Admin</option>
            </select>
            {touched.role && errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Conditional fields for investigators */}
          {formData.role === 'investigator' && (
            <>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.state && touched.state
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                    placeholder="Enter your state"
                    required={formData.role === 'investigator'}
                  />
                  {touched.state && errors.state && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.state && errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.district && touched.district
                        ? 'border -red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                    placeholder="Enter your district"
                    required={formData.role === 'investigator'}
                  />
                  {touched.district && errors.district && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.district && errors.district && (
                  <p className="mt-1 text-sm text-red-500">{errors.district}</p>
                )}
              </div>

              <div>
                <label htmlFor="policeStation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Police Station <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="policeStation"
                    name="policeStation"
                    value={formData.policeStation || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.policeStation && touched.policeStation
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors`}
                    placeholder="Enter your police station"
                    required={formData.role === 'investigator'}
                  />
                  {touched.policeStation && errors.policeStation && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.policeStation && errors.policeStation && (
                  <p className="mt-1 text-sm text-red-500">{errors.policeStation}</p>
                )}
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}