
import React from 'react';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isSignUp, onToggle }: AuthToggleProps) => {
  return (
    <>
      {/* Toggle Sign In/Sign Up */}
      <div className="text-center pt-4">
        <p className="text-white/60">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={onToggle}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      {/* Forgot Password Link (Sign In Only) */}
      {!isSignUp && (
        <div className="text-center">
          <button className="text-white/60 hover:text-white/80 text-sm transition-colors">
            Forgot your password?
          </button>
        </div>
      )}
    </>
  );
};

export default AuthToggle;
