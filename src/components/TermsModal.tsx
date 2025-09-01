import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Terms of Service</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By using Travis, you agree to these terms of service. If you do not agree, 
              please discontinue use of our service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Service Description</h3>
            <p className="text-muted-foreground">
              Travis provides travel intelligence and insights including weather forecasts, 
              currency exchange rates, local holidays, visa requirements, and other travel-related 
              information.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">User Responsibilities</h3>
            <p className="text-muted-foreground">
              You are responsible for providing accurate information and using the service 
              in compliance with applicable laws. Travel information is provided for reference 
              and should be verified with official sources.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Limitation of Liability</h3>
            <p className="text-muted-foreground">
              Travis provides information "as is" without warranties. We are not liable for 
              decisions made based on information provided through our service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Account Termination</h3>
            <p className="text-muted-foreground">
              We reserve the right to terminate accounts that violate these terms or 
              engage in harmful activities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Changes to Terms</h3>
            <p className="text-muted-foreground">
              We may update these terms periodically. Continued use of Travis constitutes 
              acceptance of updated terms.
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

export default TermsModal;