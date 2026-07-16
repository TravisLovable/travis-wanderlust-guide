// Token-native account menu for the authenticated nav.
//
// Mirrors the LiveStatus idiom (the sibling in Topbar's `trailing` slot): a
// reskinned shadcn Popover — bg-travis-bg-raised / hairline border / mono
// micro-labels — NOT the legacy DropdownMenu. When useAuth() reports no
// authenticated user this collapses to a "Sign in" button that opens the auth
// modal, so the account slot is an affordance in both states. State, sign-out,
// and the modal all come straight from useAuth; this component owns no auth
// logic of its own.
//
// `onEditProfile` is the path to a profile/settings surface. It's a callback so
// the parent decides the destination — no token-native settings screen exists
// yet, so wiring it is a deliberate follow-up rather than something this draft
// invents.

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "./IconSet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PrivacyModal from "@/components/PrivacyModal";
import TermsModal from "@/components/TermsModal";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

type UserMenuProps = {
  /** Opens a profile/settings surface. Destination wired by the parent. */
  onEditProfile?: () => void;
  className?: string;
};

/** Initials from full name (first + last), falling back to the email's leading char. */
function initialsFrom(name: string | undefined, email: string | undefined): string {
  const source = (name ?? "").trim();
  if (source) {
    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

const rowClass =
  "w-full text-left font-travis cursor-pointer border-0 bg-transparent rounded " +
  "hover:bg-white/[0.04] transition-colors";

export function UserMenu({ onEditProfile, className }: UserMenuProps) {
  const { user, userProfile, isAuthenticated, signOut, openAuthModal } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [legal, setLegal] = React.useState<null | "privacy" | "terms">(null);
  const [showDelete, setShowDelete] = React.useState(false);

  // Signed out: the account slot becomes the way in. Without this the only
  // sign-in entry point is MonitoringList's CTA, which sits below the fold.
  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className={cn(
          "inline-flex items-center bg-transparent cursor-pointer font-travis-mono uppercase",
          className,
        )}
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--ink-2)",
          border: "1px solid var(--hair-strong)",
          borderRadius: 6,
          padding: "5px 8px",
          background: "var(--bg-inset)",
        }}
      >
        Sign in
      </button>
    );
  }

  const name =
    userProfile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    "";
  const email = user?.email ?? undefined;
  const initials = initialsFrom(name, email);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer",
            className,
          )}
          style={{ padding: "4px 6px" }}
        >
          <span
            aria-hidden
            className="font-travis-mono inline-flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              border: "1px solid var(--hair-strong)",
              background: "var(--bg-inset)",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--ink-2)",
            }}
          >
            {initials}
          </span>
          <ChevronDownIcon width={10} height={10} style={{ color: "var(--ink-3)" }} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink-2 p-0 w-64"
      >
        {/* Identity */}
        <div className="flex items-center gap-3" style={{ padding: "14px 14px 12px" }}>
          <span
            aria-hidden
            className="font-travis-mono inline-flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid var(--hair-strong)",
              background: "var(--bg-inset)",
              fontSize: 12,
              color: "var(--ink)",
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <div
              className="font-travis-mono uppercase"
              style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-4)", marginBottom: 3 }}
            >
              Signed in
            </div>
            {name && (
              <div className="truncate" style={{ fontSize: 13, color: "var(--ink)" }}>
                {name}
              </div>
            )}
            {email && (
              <div className="truncate" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {email}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--hair)" }} />

        {/* Actions */}
        <div style={{ padding: 6 }}>
          {/* Only rendered once a destination is wired — a dead row reads as broken. */}
          {onEditProfile && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEditProfile();
              }}
              className={rowClass}
              style={{ padding: "10px 10px", fontSize: 13, color: "var(--ink-2)" }}
            >
              Profile &amp; settings
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setLegal("privacy");
            }}
            className={rowClass}
            style={{ padding: "10px 10px", fontSize: 13, color: "var(--ink-2)" }}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setLegal("terms");
            }}
            className={rowClass}
            style={{ padding: "10px 10px", fontSize: 13, color: "var(--ink-2)" }}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className={rowClass}
            style={{ padding: "10px 10px", fontSize: 13, color: "var(--ink-2)" }}
          >
            Sign out
          </button>

          <div style={{ height: 1, background: "var(--hair)", margin: "6px 4px" }} />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setShowDelete(true);
            }}
            className={rowClass}
            style={{ padding: "10px 10px", fontSize: 13, color: "#f87171" }}
          >
            Delete account
          </button>
        </div>
      </PopoverContent>
    </Popover>

      <PrivacyModal isOpen={legal === "privacy"} onClose={() => setLegal(null)} />
      <TermsModal isOpen={legal === "terms"} onClose={() => setLegal(null)} />
      <DeleteAccountDialog isOpen={showDelete} onClose={() => setShowDelete(false)} />
    </>
  );
}

export default UserMenu;
