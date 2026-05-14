import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
};

/**
 * Travis-styled bottom sheet. Built on shadcn/vaul Drawer.
 *
 * Use this on mobile in place of a centered modal. The handle, slide-up
 * animation, and scroll-lock behavior come from vaul; this wrapper applies
 * the Travis dark surface + tokens and provides slots for title/footer.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
}: BottomSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink",
          contentClassName,
        )}
      >
        {(title || description) && (
          <DrawerHeader>
            {title && (
              <DrawerTitle className="font-travis-display text-travis-ink">
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription className="text-travis-ink-3">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div className="px-4 pb-4 overflow-auto">{children}</div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
