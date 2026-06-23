import React, { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#F8FAFC] border border-slate-100 rounded-3xl shadow-xl max-w-sm mx-auto my-8 text-center animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500 shadow-sm">
            <AlertCircle size={26} />
          </div>
          <h2 className="text-sm font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed px-4">
            An unexpected error occurred in the application. Try reloading to restore your chat session.
          </p>
          {this.state.error && (
            <div className="w-full text-[10px] bg-red-50/50 text-red-500 border border-red-100/50 rounded-2xl p-4 mb-6 overflow-x-auto max-h-32 text-left font-mono">
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <RefreshCw size={12} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
