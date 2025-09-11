/**
 * @file components/pdf/PDFViewerCore.tsx
 * @description The core PDF viewer component built with PDF.js.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  onPageChange?: (pageNumber: number) => void;
  onTextSelect?: (selectedText: string, pageNumber: number) => void;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
}

const PDFViewerCore: React.FC<PDFViewerProps> = ({
  fileUrl,
  onPageChange,
  onTextSelect,
  onLoadSuccess,
  onLoadError,
}) => {
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfjsLibRef = useRef<typeof import('pdfjs-dist') | null>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        // Dynamic import at runtime - this avoids webpack build-time processing
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set up worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        
        pdfjsLibRef.current = pdfjsLib;
        setLoading(false);
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const doc = await loadingTask.promise;
        
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        if (onLoadSuccess) onLoadSuccess(doc.numPages);
        
      } catch (error) {
        console.error('Error loading PDF.js or document:', error);
        if (onLoadError) onLoadError(error as Error);
        setLoading(false);
      }
    };

    loadPdfJs();
  }, [fileUrl, onLoadSuccess, onLoadError]);

  useEffect(() => {
    if (!pdfDoc) return;
    const renderPage = async () => {
      const pdfDocument = pdfDoc as { getPage: (n: number) => Promise<{ getViewport: (options: { scale: number }) => { height: number; width: number }; render: (ctx: unknown) => { promise: Promise<void> } }> };
      const page = await pdfDocument.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise;
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      if (onTextSelect) onTextSelect(selection.toString().trim(), currentPage);
    }
  }, [currentPage, onTextSelect]);

  const goToPrevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const goToNextPage = () => {
    const newPage = Math.min(currentPage + 1, numPages);
    setCurrentPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading PDF.js library...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px', background: '#eee', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
        <button onClick={goToPrevPage} disabled={currentPage <= 1}>Previous</button>
        <span style={{ margin: '0 16px' }}>Page {currentPage} of {numPages}</span>
        <button onClick={goToNextPage} disabled={currentPage >= numPages}>Next</button>
        <span style={{ margin: '0 16px' }}>|</span>
        <button onClick={() => setZoom(prev => prev - 0.1)} disabled={zoom < 0.5}>-</button>
        <span style={{ margin: '0 10px' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(prev => prev + 0.1)} disabled={zoom > 2.5}>+</button>
      </div>
      <div onMouseUp={handleMouseUp} style={{ flex: 1, overflow: 'auto', textAlign: 'center', padding: '16px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PDFViewerCore;
