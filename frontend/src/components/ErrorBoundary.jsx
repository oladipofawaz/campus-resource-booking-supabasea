import { Component } from "react";
import ErrorPage from "../pages/ErrorPage";

/**
 * Class-based error boundary (required — hooks can't catch render
 * errors). Wraps the whole app in main.jsx so any unhandled render
 * error shows a friendly ErrorPage instead of a blank white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage message={this.state.message} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;