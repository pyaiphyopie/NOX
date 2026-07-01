import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="px-8 py-24 max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-3xl">!</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Something went wrong</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            An unexpected error occurred. Please try again.
          </p>
          <Link
            to="/"
            className="inline-block bg-cyan-500 text-black px-8 py-3 rounded-2xl font-bold hover:bg-cyan-400 transition no-underline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Back to Discover
          </Link>
        </section>
      );
    }

    return this.props.children;
  }
}
