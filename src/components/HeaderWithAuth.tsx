
import React, { useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import SignInButton from './SignInButton';
import UserAvatar from './UserAvatar';
import AuthModalHandler from './AuthModalHandler';

interface HeaderWithAuthProps {
  user: SupabaseUser | null;
}

const HeaderWithAuth = ({ user }: HeaderWithAuthProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <div className="absolute top-6 right-6 z-10">
        {user ? (
          <UserAvatar user={user} />
        ) : (
          <SignInButton onClick={handleSignInClick} />
        )}
      </div>
      
      <AuthModalHandler 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
      />
    </>
  );
};

export default HeaderWithAuth;
