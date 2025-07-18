import React from "react";

// PUBLIC_INTERFACE
/**
 * Fallback UI for error boundary. Displays user-friendly error message for major app errors.
 */
function FallbackErrorUI({ error, errorInfo }) {
  let message = "An unrecoverable application error occurred.";
  if (error && error.message) {
    if (
      error.message.includes("Supabase URL missing") ||
      error.message.includes("Supabase KEY missing")
    ) {
      message = "Supabase configuration error! Please contact the site administrator.";
    } else if (error.message.match(/supabase/i)) {
      message = "Error initializing Supabase. Check network, API key, or configuration.";
    } else {
      message = error.message;
    }
  }

  return (
    <div
      style={{
        padding: "2.5rem",
        textAlign: "center",
        color: "#b41010",
        maxWidth: 600,
        margin: "40px auto"
      }}
    >
      <h2>⚠️ Oops! Something went wrong.</h2>
      <p style={{ fontSize: "1.1rem", margin: "10px 0 22px" }}>{message}</p>
      {errorInfo && errorInfo.componentStack && (
        <details style={{ color: "gray", background: "#ffecec", padding: "1rem", borderRadius: 8, margin: "1rem 0" }}>
          <summary style={{ cursor: "pointer" }}>Show Error Details</summary>
          <pre style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{errorInfo.componentStack}</pre>
        </details>
      )}
      <button
        style={{
          marginTop: "18px",
          padding: "9px 28px",
          fontWeight: "bold",
          borderRadius: 6,
          border: "none",
          background: "#c74f36",
          color: "#fff",
          fontSize: "1.03rem",
          cursor: "pointer"
        }}
        onClick={() => window.location.reload()}
      >
        Reload App
      </button>
    </div>
  );
}

export default FallbackErrorUI;
