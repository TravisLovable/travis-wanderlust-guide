
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthFormProps {
  isSignUp: boolean;
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm = ({ isSignUp, formData, onInputChange, onSubmit }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name Field (Sign Up Only) */}
      {isSignUp && (
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
          />
        </div>
      )}

      {/* Email Field */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          className="pl-12 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Confirm Password Field (Sign Up Only) */}
      {isSignUp && (
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Button>
    </form>
  );
};

export default AuthForm;
