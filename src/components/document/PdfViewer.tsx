import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  content?: ArrayBuffer | Uint8Array;
  onPageChange?: (pageNumber: number, totalPages: number) => void;
}

// Detect browser type for proactive fallback
const detectBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Chrome/')) return 'chrome';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'safari';
  return 'unknown';
};

export const PdfViewer: React.FC<PdfViewerProps> = ({ content, onPageChange }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const [embedTestComplete, setEmbedTestComplete] = useState<boolean>(false);
  const [browserType] = useState<string>(detectBrowser());
  const embedTestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('PdfViewer: Content received', {
      hasContent: !!content,
      contentSize: content?.byteLength || 0,
      isArrayBuffer: content instanceof ArrayBuffer,
      isUint8Array: content instanceof Uint8Array,
      browserType: browserType
    });

    if (content && content.byteLength > 0) {
      setIsLoading(true);
      setError(null);
      setEmbedTestComplete(false);

      try {
        // Convert to Blob and create URL
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        console.log('PdfViewer: Created blob URL', {
          blobSize: blob.size,
          blobType: blob.type,
          url: url,
          browserType: browserType
        });
        
        setPdfUrl(url);
        setIsLoading(false);
        
        // For Edge browser, show fallback immediately as it commonly blocks PDF embeds
        if (browserType === 'edge') {
          console.log('PdfViewer: Edge browser detected, showing fallback immediately');
          setShowFallback(true);
          setEmbedTestComplete(true);
          return;
        }
        
        // Enhanced PDF embed test with timeout
        const testPdfEmbed = () => {
          console.log('PdfViewer: Starting enhanced PDF embed test');
          
          const testElement = document.createElement('embed');
          testElement.src = url;
          testElement.type = 'application/pdf';
          testElement.style.position = 'absolute';
          testElement.style.left = '-9999px';
          testElement.style.width = '1px';
          testElement.style.height = '1px';
          testElement.style.visibility = 'hidden';
          
          let testCompleted = false;
          
          const completeTest = (success: boolean, reason: string) => {
            if (testCompleted) return;
            testCompleted = true;
            
            console.log(`PdfViewer: Embed test ${success ? 'passed' : 'failed'} - ${reason}`);
            
            if (embedTestTimeoutRef.current) {
              clearTimeout(embedTestTimeoutRef.current);
              embedTestTimeoutRef.current = null;
            }
            
            try {
              if (document.body.contains(testElement)) {
                document.body.removeChild(testElement);
              }
            } catch (e) {
              console.warn('PdfViewer: Error removing test element:', e);
            }
            
            setShowFallback(!success);
            setEmbedTestComplete(true);
          };
          
          testElement.onload = () => completeTest(true, 'embed onload fired');
          testElement.onerror = () => completeTest(false, 'embed onerror fired');
          
          // Timeout after 2 seconds - if no load/error event, assume blocked
          embedTestTimeoutRef.current = setTimeout(() => {
            completeTest(false, 'timeout - likely blocked by browser');
          }, 2000);
          
          try {
            document.body.appendChild(testElement);
          } catch (e) {
            console.error('PdfViewer: Error appending test element:', e);
            completeTest(false, 'error appending test element');
          }
        };
        
        // Start test after a short delay to ensure DOM is ready
        setTimeout(testPdfEmbed, 100);
        
      } catch (err) {
        console.error('PdfViewer: Error creating blob URL:', err);
        setError('Failed to create PDF URL');
        setIsLoading(false);
        setEmbedTestComplete(true);
      }
    } else {
      setPdfUrl(null);
      setIsLoading(false);
      setEmbedTestComplete(true);
    }

    // Cleanup function
    return () => {
      if (embedTestTimeoutRef.current) {
        clearTimeout(embedTestTimeoutRef.current);
        embedTestTimeoutRef.current = null;
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [content, browserType]);

  const downloadPdf = () => {
    if (pdfUrl && content) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const forceFallback = () => {
    console.log('PdfViewer: User forcing fallback mode');
    setShowFallback(true);
  };

  const tryEmbedAgain = () => {
    console.log('PdfViewer: User requesting to try embed again');
    setShowFallback(false);
    setEmbedTestComplete(false);
  };

  if (isLoading || !embedTestComplete) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-muted-foreground">
            {isLoading ? 'Loading PDF...' : 'Testing PDF compatibility...'}
          </div>
          {browserType === 'edge' && (
            <div className="text-xs text-muted-foreground mt-2">
              Edge browser detected - may require manual PDF opening
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-destructive font-semibold">PDF Error</div>
          <div className="text-sm text-muted-foreground mt-2">{error}</div>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-destructive font-semibold">No PDF content</div>
          <div className="text-sm text-muted-foreground mt-2">
            Please provide valid PDF content
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            PDF Document {browserType && `(${browserType})`}
          </span>
          {!showFallback && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={forceFallback}
              className="h-5 text-xs px-2"
              title="Switch to download/open mode"
            >
              Manual Mode
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openInNewTab} className="h-6 w-6 p-0" title="Open in new tab">
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadPdf} className="h-6 w-6 p-0" title="Download PDF">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {!showFallback ? (
          <div className="w-full h-full relative">
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full min-h-0"
              style={{ minHeight: '0', height: '100%' }}
              onLoad={() => {
                console.log('PdfViewer: PDF loaded successfully in embed');
                onPageChange?.(1, 1);
              }}
              onError={(e) => {
                console.error('PdfViewer: Embed failed, switching to fallback:', e);
                setShowFallback(true);
              }}
            />
            {/* Fallback trigger overlay - appears after a delay if embed doesn't load */}
            <div className="absolute top-2 right-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={forceFallback}
                className="text-xs"
              >
                Can't see PDF? Click here
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 border border-dashed border-muted">
            <div className="text-center p-6 max-w-md">
              <div className="text-lg font-semibold text-muted-foreground mb-2">
                {browserType === 'edge' ? 'PDF Preview Unavailable' : 'PDF Preview Blocked'}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {browserType === 'edge' 
                  ? 'Microsoft Edge often blocks PDF previews for security. Use the options below to view your PDF.'
                  : 'Your browser is blocking PDF preview. Use the options below to view your PDF.'
                }
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={downloadPdf}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={openInNewTab}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                {browserType !== 'edge' && (
                  <Button 
                    variant="ghost"
                    onClick={tryEmbedAgain}
                    className="w-full text-xs"
                  >
                    Try Preview Again
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                {browserType === 'edge' 
                  ? 'To enable PDF preview in Edge: Settings → Default browser → ensure PDF files open in Microsoft Edge'
                  : 'Check your browser settings to allow PDF viewing'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};