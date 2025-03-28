"use client";

import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

type Props = { 
  pdfKey: string 
};

const PdfViewer = ({ pdfKey }: Props) => {
  const viewer = useRef(null);
  const instanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeViewer = async () => {
      // Clear previous viewer if it exists
      if (viewer.current) {
        viewer.current.innerHTML = '';
      }

      // Reset states
      setIsLoading(true);
      setError(null);

      if (!pdfKey) {
        setError('No PDF key provided');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/pdf?fileKey=${pdfKey}`);
        const data = await response.json();
        
        if (!data.url) {
          setError('Could not retrieve PDF URL');
          setIsLoading(false);
          return;
        }

        if (viewer.current) {
          const instance = await WebViewer({
            path: '/webviewer/lib',
            initialDoc: data.url,
            disabledElements: [
              'header',
              'toolbarLeft',
              'toolbarRight',
              'leftPanel',
              'searchPanel',
              'menuButton',
              'annotationToolbarButton'
            ],
            fullAPI: false,
            showLocalFilePicker: false,
            enableAnnotations: false,
            enableMeasurement: false,
            documentType: 'pdf'
          }, viewer.current);

          // Store the instance for potential future reference
          instanceRef.current = instance;

          const { documentViewer } = instance.Core;

          documentViewer.addEventListener('documentLoaded', () => {
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Error fetching or loading PDF:', error);
        setError('Failed to load PDF');
        setIsLoading(false);
      }
    };

    initializeViewer();

    // Cleanup function
    return () => {
      // Clear the viewer container
      if (viewer.current) {
        viewer.current.innerHTML = '';
      }
    };
  }, [pdfKey]);  // Runs every time pdfKey changes

  return (
    <div className="w-full h-[80vh] overflow-y-auto">
      {isLoading && <p>Loading PDF...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div 
        ref={viewer} 
        style={{ 
          width: '100%', 
          height: '100%',
          display: isLoading ? 'none' : 'block' 
        }} 
      />
    </div>
  );
};

export default PdfViewer;