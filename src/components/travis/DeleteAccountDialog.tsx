// Destructive, irreversible account deletion (Apple Guideline 5.1.1(v)).
//
// Two-step on purpose: the user must type DELETE to arm the button, and the copy
// states plainly that this is permanent — no "deactivate" softening. On success
// the account + all data are already gone server-side (delete-account function),
// so we tear down the local session and the authenticated surface unmounts.
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invokeFunction } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CONFIRM_WORD = "DELETE";

type Props = { isOpen: boolean; onClose: () => void };

export function DeleteAccountDialog({ isOpen, onClose }: Props) {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const armed = confirmText.trim().toUpperCase() === CONFIRM_WORD && !deleting;

  const handleClose = () => {
    if (deleting) return; // don't let the dialog close mid-delete
    onClose();
    setTimeout(() => setConfirmText(""), 200);
  };

  const handleDelete = async () => {
    if (!armed) return;
    setDeleting(true);
    try {
      await invokeFunction("delete-account");
      // Server-side deletion succeeded — clear the local session and return to signed-out.
      await signOut();
      toast({
        title: "Account deleted",
        description: "Your account and all of your data have been permanently removed.",
      });
    } catch (err: any) {
      // Non-200 means nothing was half-deleted from the user's perspective they need to act on —
      // the function is retryable. Keep them signed in so they can try again.
      setDeleting(false);
      toast({
        title: "Couldn't delete your account",
        description:
          err?.message ?? "Something went wrong and your account was not deleted. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Delete account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            This <span className="font-semibold text-foreground">permanently deletes your account</span> and all of
            your data — your profile, preferences, and monitored destinations. This is{" "}
            <span className="font-semibold text-foreground">irreversible</span>: it can't be undone and we can't
            recover anything afterward.
          </p>

          <div>
            <Label htmlFor="confirm-delete" className="text-sm text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">{CONFIRM_WORD}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus
              disabled={deleting}
              className="mt-1.5 text-foreground"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 text-foreground" onClick={handleClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={!armed}
            >
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccountDialog;
