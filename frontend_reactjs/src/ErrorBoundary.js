import React from "react";

// PUBLIC_INTERFACE
/**
 * Simple React error boundary that renders a fallback UI if a child throws.
 * Usage: <ErrorBoundary FallbackComponent={MyFallback}>{children}</ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ errorInfo: info });
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // Optionally log error here
    // console.error("ErrorBoundary caught:", error, info);
  }

  // PUBLIC_INTERFACE
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.FallbackComponent;
      if (Fallback) {
        // You may customize: pass error/errorInfo
        return <Fallback error={this.state.error} errorInfo={this.state.errorInfo} />;
      }
      // Default fallback if none provided
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error ? (this.state.error.message || String(this.state.error)) : "Unknown error"}</p>
          <pre style={{ color: "#900", whiteSpace: "pre-wrap", fontSize: 14 }}>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : null}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
