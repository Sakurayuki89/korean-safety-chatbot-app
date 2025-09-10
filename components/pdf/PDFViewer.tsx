/**
 * @file components/pdf/PDFViewer.tsx
 * @description Dynamically loads the PDFViewerCore component.
 *
 * This component acts as a wrapper to dynamically import the main PDF viewer,
 * which improves initial page load performance by code-splitting the heavy PDF.js library.
 */

import dynamic from 'next/dynamic';

// Dynamically import the core PDF viewer component with SSR disabled.
const PDFViewer = dynamic(() => import('./PDFViewerCore'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading PDF viewer...</div>,
});

export default PDFViewer;
