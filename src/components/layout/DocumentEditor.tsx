import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { PdfViewer } from '@/components/document/PdfViewer';
import { WordEditor } from '../document/WordEditor';

/**
 * Interface representing a document tab in the editor
 */
interface DocumentTab {
  id: string;
  title: string;
  isDirty: boolean;
  content: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  filePath?: string;
  isFileDocument?: boolean;
  binaryContent?: ArrayBuffer | Uint8Array;
}

/**
 * Mock data for development and testing
 */
const mockTabs: DocumentTab[] = [
  {
    id: '1',
    title: 'Untitled Document',
    isDirty: true,
    content: '<p>Start writing your document here...</p><p>This is a rich text editor with formatting capabilities.</p>'
  },
  {
    id: '2',
    title: 'Project Proposal',
    isDirty: false,
    content: '<h1>Project Proposal</h1><p>This is the project proposal document content...</p><ul><li>Introduction</li><li>Objectives</li><li>Timeline</li></ul>'
  }
];

/**
 * Rich text document editor component with multi-tab support
 */
export const DocumentEditor: React.FC = () => {
  const [tabs, setTabs] = useState<DocumentTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('1');

  // Get the currently active tab object
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  /**
   * TipTap editor instance with configured extensions
   */
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: activeTab?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Mark document as dirty when content changes
      if (activeTab) {
        const updatedTab = { ...activeTab, isDirty: true };
        setTabs(tabs.map(tab => tab.id === activeTab.id ? updatedTab : tab));
      }
    },
  });

  // Update editor content when active tab changes
  React.useEffect(() => {
    if (editor && activeTab) {
      editor.commands.setContent(activeTab.content);
    }
  }, [activeTabId, editor]);

  /**
   * Closes a document tab
   */
  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // If we closed the active tab, switch to the first available one
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  /**
   * Creates a new document tab
   */
  const addNewTab = () => {
    const newTab: DocumentTab = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      fileType: 'new',
      isDirty: false,
      content: '<p>Start writing your document here...</p>'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  /**
   * Adds a research document as a new tab
   */
  const addResearchDocument = (query: string, content: string) => {
    const newTab: DocumentTab = {
      id: `research-${Date.now()}`,
      title: `Research - ${query}`,
      isDirty: false,
      content: content.replace(/\n/g, '<br>')
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  /**
   * Processes file content based on file type
   */
  const processFileContent = (fileData: any) => {
    let processedContent = fileData.content;
    let tabBinaryContent = undefined;
    
    if (fileData.fileType === 'application/pdf' || fileData.fileName?.toLowerCase().endsWith('.pdf')) {
      console.log('DocumentEditor: Processing PDF file');
      processedContent = ''; // PDF content is handled by PdfViewer
      
      // Convert ArrayBuffer to Uint8Array for stability
      if (fileData.binaryContent instanceof ArrayBuffer) {
        tabBinaryContent = new Uint8Array(fileData.binaryContent);
        console.log('DocumentEditor: Converted ArrayBuffer to Uint8Array', {
          originalSize: fileData.binaryContent.byteLength,
          convertedSize: tabBinaryContent.byteLength
        });
      } else {
        tabBinaryContent = fileData.binaryContent;
      }
      
      if (!tabBinaryContent || tabBinaryContent.byteLength === 0) {
        console.error('DocumentEditor: No binary content provided for PDF file');
        processedContent = '<p><strong>Error:</strong> Unable to load PDF content.</p>';
        tabBinaryContent = undefined;
      } else {
        console.log('DocumentEditor: ✅ PDF binary content is valid');
      }
    } else if (fileData.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileData.fileType === 'application/msword' ||
               fileData.fileName?.toLowerCase().endsWith('.docx') || 
               fileData.fileName?.toLowerCase().endsWith('.doc')) {
      console.log('DocumentEditor: Processing DOCX/DOC file');
      
      // For DOCX files, show a preview message and download option
      const fileSize = fileData.binaryContent ? `${(fileData.binaryContent.byteLength / 1024).toFixed(1)} KB` : 'Unknown size';
      processedContent = `
        <div style="text-align: center; padding: 40px; border: 2px dashed #ccc; border-radius: 8px; margin: 20px 0;">
          <h3>📄 Microsoft Word Document</h3>
          <p><strong>File:</strong> ${fileData.fileName}</p>
          <p><strong>Size:</strong> ${fileSize}</p>
          <p><em>DOCX files cannot be edited directly in this editor.</em></p>
          <p>Use the download option in the file explorer to save and open with Microsoft Word or another compatible application.</p>
        </div>
      `;
      
      // Store binary content for potential future use
      if (fileData.binaryContent instanceof ArrayBuffer) {
        tabBinaryContent = new Uint8Array(fileData.binaryContent);
      } else {
        tabBinaryContent = fileData.binaryContent;
      }
    } else if (fileData.fileType === 'txt' || fileData.fileType === 'text/plain') {
      console.log('DocumentEditor: Processing text file');
      processedContent = fileData.content
        .split('\n')
        .map((line: string) => `<p>${line || '<br>'}</p>`)
        .join('');
    } else {
      console.log('DocumentEditor: Processing unsupported file type:', fileData.fileType);
      processedContent = `<p><em>Preview not available for .${fileData.fileType} files</em></p><p>File: ${fileData.fileName}</p>`;
    }

    return { processedContent, tabBinaryContent };
  };

  /**
   * Creates a new tab for a file document
   */
  const createFileTab = (fileData: any, openInNewTab: boolean = false) => {
    const { processedContent, tabBinaryContent } = processFileContent(fileData);
    
    // Always generate unique ID with timestamp to prevent tab ID conflicts
    const tabId = `file-${fileData.fileId}-${Date.now()}`;
    
    const newTab: DocumentTab = {
      id: tabId,
      title: openInNewTab ? `${fileData.fileName} (Copy)` : fileData.fileName,
      isDirty: false,
      content: processedContent,
      fileId: fileData.fileId,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      filePath: fileData.filePath,
      isFileDocument: true,
      binaryContent: tabBinaryContent
    };
    
    console.log('DocumentEditor: Created new tab:', {
      id: newTab.id,
      title: newTab.title,
      fileType: newTab.fileType,
      hasBinaryContent: !!newTab.binaryContent,
      binaryContentSize: newTab.binaryContent?.byteLength || 0,
      openInNewTab
    });
    
    return newTab;
  };

  /**
   * Opens a file document as a new tab
   */
  const openFileDocument = (fileData: any) => {
    console.log('DocumentEditor: Opening file document:', {
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      hasBinaryContent: !!fileData.binaryContent,
      binaryContentSize: fileData.binaryContent?.byteLength || 0
    });

    // Check if file is already open by fileId only (most reliable identifier)
    const existingTabsForFile = tabs.filter(tab => tab.fileId === fileData.fileId);
    
    if (existingTabsForFile.length > 0) {
      // Switch to the most recently opened tab for this file
      const mostRecentTab = existingTabsForFile.sort((a, b) => 
        parseInt(b.id.split('-').pop() || '0') - parseInt(a.id.split('-').pop() || '0')
      )[0];
      
      console.log('DocumentEditor: File already open, switching to most recent tab', {
        existingTabId: mostRecentTab.id,
        existingTabTitle: mostRecentTab.title,
        totalTabsForFile: existingTabsForFile.length
      });
      setActiveTabId(mostRecentTab.id);
      return;
    }

    const newTab = createFileTab(fileData, false);
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
    console.log('DocumentEditor: === FILE DOCUMENT OPENED ===');
  };

  /**
   * Opens a file document in a new tab (always creates new tab)
   */
  const openFileDocumentInNewTab = (fileData: any) => {
    console.log('DocumentEditor: Opening file document in new tab:', {
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      hasBinaryContent: !!fileData.binaryContent,
      binaryContentSize: fileData.binaryContent?.byteLength || 0
    });

    const newTab = createFileTab(fileData, true);
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
    console.log('DocumentEditor: === FILE DOCUMENT OPENED IN NEW TAB ===');
  };

  // Add debounce state to prevent multiple rapid clicks
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const DEBOUNCE_DELAY = 300; // 300ms debounce

  // Listen for file document opening events
  React.useEffect(() => {
    const handleResearchDocument = (event: CustomEvent) => {
      const { query, content } = event.detail;
      addResearchDocument(query, content);
    };

    const handleFileDocument = (event: CustomEvent) => {
      // Debounce to prevent multiple rapid clicks
      const now = Date.now();
      if (now - lastClickTime < DEBOUNCE_DELAY) {
        console.log('DocumentEditor: Ignoring rapid click (debounced)');
        return;
      }
      setLastClickTime(now);

      console.log('DocumentEditor: Received file-document-open event:', {
        fileId: event.detail?.fileId,
        fileName: event.detail?.fileName,
        fileType: event.detail?.fileType,
        hasBinaryContent: !!event.detail?.binaryContent,
        binaryContentSize: event.detail?.binaryContent?.byteLength || 0
      });
      
      if (!event.detail) {
        console.error('DocumentEditor: No detail provided in file-document-open event');
        return;
      }
      
      openFileDocument(event.detail);
    };

    const handleFileDocumentNewTab = (event: CustomEvent) => {
      console.log('DocumentEditor: Received file-document-open-new-tab event:', {
        fileId: event.detail?.fileId,
        fileName: event.detail?.fileName,
        fileType: event.detail?.fileType,
        hasBinaryContent: !!event.detail?.binaryContent,
        binaryContentSize: event.detail?.binaryContent?.byteLength || 0
      });
      
      if (!event.detail) {
        console.error('DocumentEditor: No detail provided in file-document-open-new-tab event');
        return;
      }
      
      openFileDocumentInNewTab(event.detail);
    };

    window.addEventListener('research-document-created', handleResearchDocument as EventListener);
    window.addEventListener('file-document-open', handleFileDocument as EventListener);
    window.addEventListener('file-document-open-new-tab', handleFileDocumentNewTab as EventListener);
    
    return () => {
      window.removeEventListener('research-document-created', handleResearchDocument as EventListener);
      window.removeEventListener('file-document-open', handleFileDocument as EventListener);
      window.removeEventListener('file-document-open-new-tab', handleFileDocumentNewTab as EventListener);
    };
  }, [lastClickTime]); // Include lastClickTime in dependencies

  // Debug: Log active tab binary content
  React.useEffect(() => {
    if (activeTab) {
      console.log('DocumentEditor: Active tab binary content debug:', {
        tabId: activeTab.id,
        fileName: activeTab.fileName,
        fileType: activeTab.fileType,
        hasBinaryContent: !!activeTab.binaryContent,
        binaryContentSize: activeTab.binaryContent?.byteLength || 0,
        isArrayBuffer: activeTab.binaryContent instanceof ArrayBuffer
      });
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Strip */}
      <div className="flex items-center bg-editor-surface border-b border-editor-border">
        <ScrollArea className="flex-1">
          <div className="flex">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 border-r border-editor-border cursor-pointer transition-colors group min-w-0 ${
                  activeTabId === tab.id 
                    ? 'bg-content-background text-text-primary' 
                    : 'bg-editor-surface hover:bg-editor-surface-hover text-text-secondary'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="text-sm truncate max-w-32">
                  {tab.title}
                  {tab.isDirty && ' •'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-editor-surface-active flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* New Tab Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={addNewTab}
          className="h-8 w-8 p-0 mx-2 hover:bg-editor-surface-hover flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab ? (
          <div className="h-full overflow-hidden">
            {/* {(activeTab?.fileType === 'application/pdf' || activeTab?.fileName?.toLowerCase().endsWith('.pdf')) && activeTab?.fileType !== 'private' ? (
              <div className="h-full">
                <PdfViewer 
                  content={activeTab.binaryContent}
                  onPageChange={(page, total) => {
                    console.log('DocumentEditor: Page change:', { page, total, activeTabId });
                  }}
                />
              </div>
            ) : ( */}
              <div className="h-full overflow-auto">
                <div className="mx-auto h-full">
                  <WordEditor
                    activeTab={activeTab}
                    activeTabId={activeTabId} />
                  {/* <EditorContent 
                    editor={editor} 
                    className="min-h-full focus-within:outline-none"
                  /> */}
                </div>
              </div>
            {/* )} */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-text-muted mb-4">No documents open</p>
              <Button onClick={addNewTab} className="bg-accent-blue hover:bg-accent-blue-hover">
                Create New Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};