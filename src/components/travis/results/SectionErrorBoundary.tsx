import * as React from "react";

type SectionErrorBoundaryProps = {
  /** Label shown in the inline error notice (e.g. "Must Know"). */
  label: string;
  children: React.ReactNode;
};

type SectionErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

/**
 * Catches render errors inside a single section so one bad card doesn't
 * blank the entire `/search` page. Renders an inline notice in Travis
 * tokens. Logs the error to the console for debugging.
 */
export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): SectionErrorBoundaryState {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error(
      `[SectionErrorBoundary:${this.props.label}] render error`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="max-w-[1180px] mx-auto w-full px-5 md:px-0"
          style={{ marginTop: 12, marginBottom: 12 }}
        >
          <div
            className="font-travis"
            style={{
              border: "1px solid var(--hair-strong)",
              borderLeft: "2px solid var(--signal-stop)",
              borderRadius: 6,
              background: "var(--bg-inset)",
              padding: "14px 18px",
            }}
          >
            <div
              className="font-travis-mono uppercase"
              style={{
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--signal-stop)",
                marginBottom: 6,
              }}
            >
              {this.props.label} · render error
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
              This section failed to render. Other sections continue to work.
            </div>
            <div
              className="font-travis-mono"
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--ink-4)",
                wordBreak: "break-word",
              }}
            >
              {this.state.message}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
