import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, Search, FilePlus, FolderPlus, Shield, Download, Trash, ExternalLink, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusDot } from '@/components/ui/status-dot';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useFolderOperations } from '@/hooks/useFolderOperations';
import { usePrivateFileOperations } from '@/hooks/usePrivateFileOperations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { appConfig } from '@/lib/config';

interface FilesExplorerProps {
  isOpen: boolean;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  isOpen?: boolean;
  status?: 'uploaded' | 'cached' | 'missing';
  supabaseFileId?: string; // Track Supabase file ID for uploaded files
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    isOpen: true,
    children: [
      { id: '2', name: 'Project Proposal.docx', type: 'file', status: 'missing' },
      { id: '3', name: 'Meeting Notes.docx', type: 'file', status: 'missing' },
      { id: '4', name: 'Draft Article.docx', type: 'file', status: 'missing' },
    ]
  },
  {
    id: '5',
    name: 'Templates',
    type: 'folder',
    children: [
      { id: '6', name: 'Letter Template.docx', type: 'file', status: 'missing' },
      { id: '7', name: 'Report Template.docx', type: 'file', status: 'missing' },
    ]
  }
];

const LOCAL_FILES_FOLDER_ID = 'local-files-folder';
const LOCAL_FILE_COLOR = 'purple';

const FileTreeItem: React.FC<{ item: FileItem; level: number }> = ({ item, level }) => {
  const [isOpen, setIsOpen] = useState(item.isOpen || false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [skipDeleteWarning, setSkipDeleteWarning] = useState(false);
  const { readFileContent } = useFileOperations();
  const { toast } = useToast();

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const openFile = async (openInNewTab: boolean = false) => {
    if (item.type === 'file' && item.supabaseFileId) {
      console.log('=== FILE OPENING ===', { openInNewTab });
      console.log('File item:', {
        id: item.id,
        name: item.name,
        supabaseFileId: item.supabaseFileId
      });
      
      try {
        // Find the file path from the file data
        const { data: fileData } = await supabase
          .from('documents')
          .select('file_path, original_filename')
          .eq('id', item.supabaseFileId)
          .single();

        console.log('File data from database:', fileData);

        if (fileData) {
          console.log('Reading file content...');
          const fileContent = await readFileContent(fileData.file_path, fileData.original_filename);
          
          console.log('File content read successfully:', {
            fileName: fileContent.fileName,
            fileType: fileContent.fileType,
            hasContent: !!fileContent.content,
            hasBinaryContent: !!fileContent.binaryContent,
            binaryContentSize: fileContent.binaryContent?.byteLength || 0
          });
          
          // Dispatch event to open file in document editor
          const eventDetail = {
            fileId: item.supabaseFileId,
            fileName: fileContent.fileName,
            content: fileContent.content,
            fileType: fileContent.fileType,
            filePath: fileContent.filePath,
            binaryContent: fileContent.binaryContent,
            openInNewTab
          };
          
          const eventName = openInNewTab ? 'file-document-open-new-tab' : 'file-document-open';
          console.log(`Dispatching ${eventName} event with detail:`, eventDetail);
          
          window.dispatchEvent(new CustomEvent(eventName, {
            detail: eventDetail
          }));
        } else {
          console.error('No file data found for ID:', item.supabaseFileId);
        }
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
    else if (item.type === 'file') {
      const fileNameArray = item.name.split('.')
      const eventDetail = {
        fileId: item.name,
        fileName: item.name,
        content: null,
        fileType: 'private',
        filePath: item.name,
        binaryContent: null,
        openInNewTab
      };

      const eventName = openInNewTab ? 'file-document-open-new-tab' : 'file-document-open';
      console.log(`Dispatching ${eventName} event with detail:`, eventDetail);

      window.dispatchEvent(new CustomEvent(eventName, {
        detail: eventDetail
      }));
    }
  };

  const handleFileClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await openFile(false);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.type === 'file' && item.supabaseFileId) {
      try {
        // Find the file path from the file data
        const { data: fileData } = await supabase
          .from('documents')
          .select('file_path, original_filename')
          .eq('id', item.supabaseFileId)
          .single();

        if (fileData) {
          const fileContent = await readFileContent(fileData.file_path, fileData.original_filename);
          
          // Create blob based on file type
          let blob: Blob;
          if (fileContent.binaryContent) {
            // For binary files like PDFs, DOCX, etc.
            blob = new Blob([fileContent.binaryContent], { type: fileContent.fileType || 'application/octet-stream' });
          } else {
            // For text files
            blob = new Blob([fileContent.content], { type: 'text/plain' });
          }
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileData.original_filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user wants to skip warnings
    const skipWarnings = localStorage.getItem('skipDeleteWarnings') === 'true';
    
    if (skipWarnings) {
      confirmDelete();
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleConvertToDocx = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.type === 'file' && item.supabaseFileId) {
      try {
        toast({
          title: "Converting PDF to DOCX",
          description: "Please wait while we convert your PDF file...",
        });

        const response = await fetch(`${appConfig.backend.url}/api/v1/convert/convert-existing-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_id: item.supabaseFileId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Conversion failed');
        }

        // Get the filename from the response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'converted.docx';
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="?([^"]+)"?/);
          if (matches) {
            filename = matches[1];
          }
        }

        // Just consume the response to complete the request
        await response.blob();
        
        toast({
          title: "Conversion successful",
          description: `PDF has been converted to DOCX as ${filename}. You can find it in your file explorer and download it from there.`,
        });

        // Refresh the file list to show the new DOCX file
        window.dispatchEvent(new Event('file-uploaded'));
        
      } catch (error) {
        console.error('Error converting PDF to DOCX:', error);
        toast({
          title: "Conversion failed",
          description: error instanceof Error ? error.message : "Failed to convert PDF to DOCX.",
          variant: "destructive"
        });
      }
    }
  };

  // Check if the file is a PDF
  const isPdfFile = item.type === 'file' && item.name.toLowerCase().endsWith('.pdf');

  const confirmDelete = async () => {
    if (item.type === 'file' && item.supabaseFileId) {
      try {
        // Get file path for storage deletion
        const { data: fileData } = await supabase
          .from('documents')
          .select('file_path')
          .eq('id', item.supabaseFileId)
          .single();

        if (fileData) {
          // Delete from storage
          await supabase.storage
            .from('documents')
            .remove([fileData.file_path]);
        }

        // Delete from database
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', item.supabaseFileId);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to delete file",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "File deleted successfully",
          });
          
          // Trigger file list refresh
          window.dispatchEvent(new CustomEvent('file-uploaded'));
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
      }
    }
    setShowDeleteDialog(false);
  };

  const handleDialogConfirm = () => {
    if (skipDeleteWarning) {
      localStorage.setItem('skipDeleteWarnings', 'true');
    }
    confirmDelete();
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex items-center gap-2 py-1 px-2 hover:bg-rail-hover rounded text-sm transition-colors`}
            style={{ paddingLeft: `${8 + level * 16}px` }}
          >
            <div 
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={item.type === 'folder' ? handleToggle : handleFileClick}
            >
            {item.type === 'file' && item.status && (
              <StatusDot status={item.status} />
            )}
            {item.type === 'folder' ? (
              isOpen ? (
                <FolderOpen className="h-4 w-4 text-accent-blue" />
              ) : (
                <Folder className="h-4 w-4 text-accent-blue" />
              )
            ) : (
              <File className="h-4 w-4 text-text-secondary" />
            )}
              <span className={`text-text-primary truncate ${item.status === 'missing' ? 'opacity-50' : ''}`}>
                {item.name}
              </span>
            </div>
            {item.type === 'file' && item.supabaseFileId && (
              <div className="flex gap-1">
                <button
                  onClick={handleDownload}
                  className="opacity-30 hover:opacity-100 transition-opacity p-1 rounded hover:bg-rail-hover"
                  title="Download file"
                >
                  <Download className="h-3 w-3 text-text-secondary" />
                </button>
                <button
                  onClick={handleDelete}
                  className="opacity-30 hover:opacity-100 transition-opacity p-1 rounded hover:bg-rail-hover"
                  title="Delete file"
                >
                  <Trash className="h-3 w-3 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        
        {item.type === 'file' && item.supabaseFileId && (
          <ContextMenuContent>
            <ContextMenuItem onClick={() => openFile(false)}>
              <File className="h-4 w-4 mr-2" />
              Open
            </ContextMenuItem>
            <ContextMenuItem onClick={() => openFile(true)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
            {isPdfFile && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleConvertToDocx}>
                  <FileText className="h-4 w-4 mr-2" />
                  Convert to DOCX
                </ContextMenuItem>
              </>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone and will remove the file from both your documents and storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center space-x-2 my-4">
            <Checkbox 
              id="skip-warning" 
              checked={skipDeleteWarning}
              onCheckedChange={(checked) => setSkipDeleteWarning(checked as boolean)}
            />
            <label htmlFor="skip-warning" className="text-sm text-text-secondary">
              Don't ask me again for file deletions
            </label>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDialogConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FilesExplorer: React.FC<FilesExplorerProps> = ({ isOpen }) => {
  const { triggerFileUpload, isUploading, fetchSupabaseFiles, uploadFile } = useFileOperations();
  const { triggerPrivateFileUpload, isUploading: isPrivateUploading, fetchPrivateFiles } = usePrivateFileOperations();
  const { promptCreateFolder, isCreating } = useFolderOperations();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [lastLoadError, setLastLoadError] = useState<string | null>(null);
  
  /**
   * Adds a research document to the files list
   * 
   * @param query - The original research query
   */
  const addResearchFile = (query: string) => {
    // Find or create the Research folder
    let researchFolder = files.find(item => item.name === 'Research' && item.type === 'folder');
    
    if (!researchFolder) {
      researchFolder = {
        id: 'research-folder',
        name: 'Research',
        type: 'folder',
        isOpen: true,
        children: []
      };
      setFiles(prevFiles => [...prevFiles, researchFolder!]);
    }
    
    // Add the research file to the Research folder
    const researchFile = {
      id: `research-file-${Date.now()}`,
      name: `Research - ${query}.txt`,
      type: 'file' as const,
      status: 'cached' as const // Research files are cached but not uploaded
    };
    
    setFiles(prevFiles => 
      prevFiles.map(item => 
        item.id === researchFolder!.id 
          ? { ...item, children: [...(item.children || []), researchFile] }
          : item
      )
    );
  };
  
  // Listen for research document creation events
  React.useEffect(() => {
    const handleResearchDocument = (event: CustomEvent) => {
      const { query } = event.detail;
      addResearchFile(query);
    };

    window.addEventListener('research-document-created', handleResearchDocument as EventListener);
    
    return () => {
      window.removeEventListener('research-document-created', handleResearchDocument as EventListener);
    };
  }, []);

  // Manual refresh function
  const refreshFiles = async () => {
    console.log('=== MANUAL REFRESH FILES ===');
    await loadAllFiles();
  };

  // Fetch Supabase files and merge into file tree
  const loadAllFiles = async () => {
    if (authLoading) {
      console.log('Auth still loading, skipping file fetch');
      return;
    }

    console.log('=== LOADING ALL FILES ===', { 
      isAuthenticated, 
      user: user?.id, 
      authLoading 
    });

    setIsLoadingFiles(true);
    setLastLoadError(null);
    
    try {
      const [supabaseFiles, privateFiles] = await Promise.all([
        isAuthenticated ? fetchSupabaseFiles() : Promise.resolve([]),
        fetchPrivateFiles()
      ]);
      
      console.log('Files loaded:', { 
        supabaseFiles: supabaseFiles?.length || 0, 
        privateFiles: privateFiles?.length || 0,
        isAuthenticated 
      });
        
        let fileTree: FileItem[] = [];
        
        // Handle Supabase files
        if (supabaseFiles && supabaseFiles.length > 0) {
          const supabaseFileItems: FileItem[] = await Promise.all(
            supabaseFiles.map(async (f: any) => {
              let status: 'uploaded' | 'missing' = 'uploaded';
              
              // Check if file actually exists in storage
              try {
                const { data: fileExists } = await supabase.storage
                  .from('documents')
                  .list(f.file_path.split('/').slice(0, -1).join('/'), {
                    search: f.file_path.split('/').pop()
                  });
                
                if (!fileExists || fileExists.length === 0) {
                  status = 'missing';
                }
              } catch {
                status = 'missing';
              }
              
              return {
                id: f.id,
                name: f.original_filename,
                type: 'file' as const,
                status,
                supabaseFileId: f.id
              };
            })
          );
          
          fileTree.push({
            id: 'my-documents-folder',
            name: 'My Documents',
            type: 'folder',
            isOpen: true,
            children: supabaseFileItems,
          });
        }
        
        // Handle private files
        if (privateFiles && privateFiles.length > 0) {
          const privateFileItems: FileItem[] = privateFiles.map((f: any) => ({
            id: `private-${f.filename}`,
            name: f.original_filename || f.filename,
            type: 'file' as const,
            status: 'uploaded' as const // Private files are considered uploaded to local storage
          }));
          
          fileTree.push({
            id: 'private-files-folder',
            name: 'Private Files',
            type: 'folder',
            isOpen: true,
            children: privateFileItems,
          });
        }
        
        // Always include mock files as missing files for demonstration
        fileTree.push(...mockFiles);
        
        console.log('Final file tree:', fileTree);
        setFiles(fileTree);
      } catch (error) {
        console.error('Error loading files:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setLastLoadError(errorMessage);
        
        toast({
          title: "Failed to load files",
          description: isAuthenticated ? "Please try refreshing or check your connection" : "Please sign in to see your documents",
          variant: "destructive",
        });
        
        // Set default files if loading fails
        setFiles(mockFiles);
      } finally {
        setIsLoadingFiles(false);
      }
    };

  useEffect(() => {
    // Only load files when authentication state is resolved
    if (!authLoading) {
      loadAllFiles();
    }
  }, [isAuthenticated, authLoading]); // Depend on auth state

  useEffect(() => {
    
    // Listen for file upload events to refresh
    const handleFileUploaded = () => {
      console.log('File uploaded event received, refreshing files...');
      loadAllFiles();
    };
    const handlePrivateFileUploaded = () => {
      console.log('Private file uploaded event received, refreshing files...');
      loadAllFiles();
    };
    
    window.addEventListener('file-uploaded', handleFileUploaded);
    window.addEventListener('private-file-uploaded', handlePrivateFileUploaded);
    
    return () => {
      window.removeEventListener('file-uploaded', handleFileUploaded);
      window.removeEventListener('private-file-uploaded', handlePrivateFileUploaded);
    };
  }, [isAuthenticated]); // Depend on auth state for event handlers
  
  // Remove custom upload handler based on destination
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.pdf,.doc,.docx,.txt,.rtf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-rail-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">Files</span>
          {isLoadingFiles && (
            <RefreshCw className="h-3 w-3 animate-spin text-text-muted" />
          )}
          {lastLoadError && (
            <span className="text-xs text-red-500" title={lastLoadError}>⚠️</span>
          )}
        </div>
        <div className="flex gap-1 items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-rail-hover"
            onClick={refreshFiles}
            disabled={isLoadingFiles}
            title="Refresh files"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-rail-hover"
            onClick={promptCreateFolder}
            disabled={isCreating}
            title="New folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-rail-hover"
            onClick={handleUpload}
            disabled={isUploading}
            title="Upload to Supabase"
          >
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-rail-hover"
            onClick={triggerPrivateFileUpload}
            disabled={isPrivateUploading}
            title="Private Upload (Local Storage)"
          >
            <Shield className="h-4 w-4 text-green-600" />
          </Button>
        </div>
      </div>
      {/* Remove upload destination label */}

      {/* Search */}
      <div className="p-3 border-b border-rail-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search files..."
            className="pl-8 h-8 bg-editor-surface border-editor-border text-sm"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.map((item) => (
            <FileTreeItem key={item.id} item={item} level={0} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};