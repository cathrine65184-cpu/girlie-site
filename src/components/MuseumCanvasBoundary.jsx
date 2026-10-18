import { Component, useState } from 'react';
import { useLocale } from '../locales.jsx';

class CanvasBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

// The story gallery and navigation remain usable on devices without WebGL.
export function MuseumCanvasBoundary({ children }) {
  const { t } = useLocale();
  const [supported] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      return Boolean(context);
    } catch { return false; }
  });
  const fallback = <div className="museum-webgl-fallback"><p>{t('depthWebglFallback')}</p></div>;
  return supported ? <CanvasBoundary fallback={fallback}>{children}</CanvasBoundary> : fallback;
}
