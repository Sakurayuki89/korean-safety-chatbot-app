
import { useState, useCallback } from 'react';

interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  selectedText: string | null;
  error: Error | null;
  isLoading: boolean;
}

const usePDFViewer = () => {
  const [state, setState] = useState<PDFViewerState>({
    currentPage: 1,
    totalPages: 0,
    zoom: 1.0,
    selectedText: null,
    error: null,
    isLoading: true,
  });

  const onDocumentLoadSuccess = useCallback((numPages: number) => {
    setState(prevState => ({
      ...prevState,
      totalPages: numPages,
      isLoading: false,
      error: null,
    }));
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setState(prevState => ({
      ...prevState,
      error,
      isLoading: false,
    }));
  }, []);

  const onPageChange = useCallback((pageNumber: number) => {
    setState(prevState => ({
      ...prevState,
      currentPage: pageNumber,
    }));
  }, []);

  const onTextSelect = useCallback((selectedText: string) => {
    setState(prevState => ({
      ...prevState,
      selectedText,
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prevState => ({
      ...prevState,
      zoom,
    }));
  }, []);

  return {
    ...state,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    onPageChange,
    onTextSelect,
    setZoom,
  };
};

export default usePDFViewer;
