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
      <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink max-w-2xl max-h-[80vh] overflow-y-auto">
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
              When you create an account and set up your profile, Travis collects your name,
              email address, phone number, country of citizenship (from your passport), and
              home city — along with your travel preferences, such as preferred airlines,
              frequent-flyer tier, travel style and pace, and which alerts you want. We also
              keep the destinations you search for and save. We do{' '}
              <span className="font-medium text-foreground">not</span> collect or store your
              passport number.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground">
              When the app starts, we estimate your country and city from your IP address so we
              can set your home location for you. This is an approximate, IP-based estimate
              provided by third parties (ipapi.co and ipwho.is), and you can change it anytime.
              Travis does not access your device's GPS or precise location.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">How We Use Your Information</h3>
            <p className="text-muted-foreground">
              We use your information to provide travel insights, personalize your experience,
              and keep your account working. We do not sell your personal information, and we do
              not use it for advertising or cross-app tracking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">AI-Generated Insights</h3>
            <p className="text-muted-foreground">
              To generate personalized insights, we send the destination you're viewing — along
              with your first name, home city, and country of citizenship — to third-party AI
              providers (OpenAI and Anthropic). They use this only to produce your insights, not
              to build a profile of you.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Third-Party Services</h3>
            <p className="text-muted-foreground">
              Travis relies on third-party services to work, and shares only what each one needs:
            </p>
            <ul className="text-muted-foreground list-disc pl-5 mt-2 space-y-1">
              <li><span className="text-foreground">Supabase</span> — our backend; stores your account and profile data.</li>
              <li><span className="text-foreground">Google Places</span> — destination search (receives what you type).</li>
              <li><span className="text-foreground">OpenAI &amp; Anthropic</span> — generate travel insights (see above).</li>
              <li><span className="text-foreground">WeatherAPI &amp; Open-Meteo</span> — weather and UV for the destination.</li>
              <li><span className="text-foreground">Ticketmaster</span> — local events for the destination and dates.</li>
              <li><span className="text-foreground">ipapi.co &amp; ipwho.is</span> — approximate location from your IP (see Location).</li>
              <li>
                <span className="text-foreground">exchangerate-api, REST Countries, WHO, Nager.Date, Time and Date, Travel Buddy</span>{' '}
                — currency, country, health, holiday, and visa reference data, looked up by
                country (no personal data sent).
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Each service has its own privacy policy governing the data it receives.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Data Retention &amp; Deletion</h3>
            <p className="text-muted-foreground">
              We keep your data for as long as your account is active. You can permanently delete
              your account and all associated data at any time from the account menu (your initials,
              top right) → <span className="text-foreground">Delete account</span>. Deletion is
              immediate and irreversible.
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
