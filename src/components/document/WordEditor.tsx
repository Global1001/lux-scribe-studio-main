import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { appConfig } from '@/lib/config';
import { useAuth } from '@/hooks/useAuth';

interface WordEditorProps {
  activeTab: {
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
  },
  activeTabId: string,
}

export const WordEditor: React.FC<WordEditorProps> = ({ activeTab, activeTabId }) => {
  const [pastTabId, setPastTabId] = useState<string>(null);
  const wordEditors = useRef({});

  const createEditor = (data: Object) => {
    const container = document.getElementById("onlyoffice-editor-container");
    if (container) {
      const subContainer = document.createElement("div");
      subContainer.id = `onlyoffice-editor-subcontainer-${activeTabId}`;
      subContainer.classList.add('h-full');

      const editorDiv = document.createElement("div");
      editorDiv.id = `onlyoffice-editor-${activeTabId}`;
      editorDiv.style.height = "100vh";
      editorDiv.style.width = "100%";

      subContainer.appendChild(editorDiv);
      container.appendChild(subContainer);

      setPastTabId(activeTabId);
    }

    const script = document.createElement('script');
    script.src = 'https://onlyoffice.oblisk.ai/web-apps/apps/api/documents/api.js ';
    script.onload = () => {
      wordEditors.current[activeTabId] = {
        editorInstance: new DocsAPI.DocEditor(`onlyoffice-editor-${activeTabId}`, data),
        editorConfig: data
      }
    };
    document.body.appendChild(script);
  }

  const showEditor = async () => {
    try {
      const pastDOM = document.getElementById(`onlyoffice-editor-subcontainer-${pastTabId}`), activeDOM = document.getElementById(`onlyoffice-editor-subcontainer-${activeTabId}`);
      if (pastDOM) {
        pastDOM.style.display = 'none';
      }
      if (activeDOM) {
        activeDOM.style.display = 'block';
        setPastTabId(activeTabId);
      } else {
        const fileNameArray = activeTab?.fileName?.toLowerCase()?.split('.');
        if (activeTab?.fileType === 'private') {
          const response = await fetch(`${appConfig.backend.url}/api/v1/document/editor-config`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileType: fileNameArray?.[fileNameArray?.length - 1],
              title: activeTab?.title,
              fileName: activeTab?.filePath,
              baseUrl: appConfig.backend.url,
              documentType: 'word',
              theme: localStorage.getItem('theme') || 'dark'
            }),
          });
          const data = await response.json();
          createEditor(data);
        } else if (activeTab?.fileType === 'new') {
          const response = await fetch(`${appConfig.backend.url}/api/v1/document/editor-config`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileType: 'new',
              baseUrl: appConfig.backend.url,
              documentType: 'word',
              theme: localStorage.getItem('theme') || 'dark'
            }),
          });
          const data = await response.json();
          createEditor(data);
          window.dispatchEvent(new CustomEvent('private-file-uploaded'));
        } else {
          const { data, error } = await supabase.functions.invoke('editor-config', {
            body: {
              fileType: fileNameArray?.[fileNameArray?.length - 1],
              key: [...Array(30)].map(() => Math.random().toString(36)[2]).join(''),
              title: activeTab?.title,
              fileName: activeTab?.filePath,
              documentType: 'word',
              theme: localStorage.getItem('theme') || 'dark'
            }
          });
          createEditor(data);
        }
      }
    } catch (err) {
      console.error('Exception in WordEditor:', err);
    }
  }

  const handleThemeToggled = (event: CustomEvent) => {
    const theme = event.detail;
    for (const tabId in wordEditors.current) {
      if (wordEditors.current[tabId].editorInstance) {
        wordEditors.current[tabId].editorInstance.destroyEditor();
        wordEditors.current[tabId].editorConfig.editorConfig.customization.uiTheme = `theme-${theme}`;
        wordEditors.current[tabId].editorInstance = DocsAPI.DocEditor(`onlyoffice-editor-${tabId}`, wordEditors.current[tabId].editorConfig);
      }
    }
  }

  useEffect(() => {
    showEditor();
  }, [activeTabId]);

  useEffect(() => {
    window.addEventListener('theme-toggled', handleThemeToggled as EventListener);
    
    return () => {
      window.removeEventListener('theme-toggled', handleThemeToggled as EventListener);
    }
  }, [])

  return (
    <div id="onlyoffice-editor-container" className="h-full">
    </div>
  );
};