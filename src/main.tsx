import { Component, ErrorInfo, ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg, #080d18)",
          color: "var(--text, #ffffff)",
          padding: "20px",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}>
          <div style={{
            maxWidth: "420px",
            background: "rgba(255, 255, 255, 0.05)",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Une interruption est survenue</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", marginBottom: "20px" }}>
              Vos données sauvegardées en local restent conservées.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#6975f5",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px"
              }}
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
