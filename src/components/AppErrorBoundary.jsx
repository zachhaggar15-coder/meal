import { Component } from 'react';
import { claimChunkReload } from '../utils/errorRecovery.js';

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof window === 'undefined') return;

    const shouldReload = claimChunkReload(error, {
      pathname: window.location.pathname,
      storage: window.sessionStorage,
    });

    if (shouldReload) window.location.reload();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="route-error" role="alert" aria-labelledby="route-error-heading">
        <p className="eyebrow">Something went wrong</p>
        <h1 id="route-error-heading">This page could not be loaded</h1>
        <p>
          The site may have been updated while this page was open. Reload it to get the latest version,
          or return to the meal plans.
        </p>
        <div className="route-error-actions">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a className="btn-secondary" href="/browse">Browse meal plans</a>
        </div>
      </section>
    );
  }
}
