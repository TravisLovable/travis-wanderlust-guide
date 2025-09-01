import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy Policy</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Information We Collect</h3>
            <p className="text-muted-foreground">
              Travis collects information you provide directly, such as your travel preferences, 
              destination searches, and profile information. We also collect usage data to improve 
              our services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">How We Use Your Information</h3>
            <p className="text-muted-foreground">
              We use your information to provide travel insights, personalize your experience, 
              and improve our services. We do not sell your personal information to third parties.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Data Security</h3>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Third-Party Services</h3>
            <p className="text-muted-foreground">
              Travis integrates with third-party services (Google Places, Mapbox, weather APIs) 
              to provide travel information. These services have their own privacy policies.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-muted-foreground">
              For privacy-related questions, please contact us through our support channels.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
