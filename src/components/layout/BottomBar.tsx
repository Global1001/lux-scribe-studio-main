import React, { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Search, Replace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const BottomBar: React.FC = () => {
  const [mode, setMode] = useState<'formatting' | 'find-replace'>('formatting');
  const [wordCount, setWordCount] = useState(247);

  return (
    <div className="flex items-center justify-between h-10 px-4 bg-editor-surface">
      {mode === 'formatting' ? (
        <>
          {/* Left section - Formatting tools */}
          <div className="flex items-center gap-1">
            {/* Font Family */}
            <Select defaultValue="serif">
              <SelectTrigger className="w-32 h-8 text-xs bg-transparent border-editor-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Times New Roman</SelectItem>
                <SelectItem value="sans">Arial</SelectItem>
                <SelectItem value="mono">Courier New</SelectItem>
              </SelectContent>
            </Select>

            {/* Font Size */}
            <Select defaultValue="12">
              <SelectTrigger className="w-16 h-8 text-xs bg-transparent border-editor-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="14">14</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="18">18</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Text formatting */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <Underline className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Alignment */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <AlignRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Lists */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-editor-surface-hover">
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Right section - Word count and controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('find-replace')}
              className="h-8 px-2 text-xs hover:bg-editor-surface-hover"
            >
              <Search className="h-3 w-3 mr-1" />
              Find
            </Button>
            
            <Badge variant="outline" className="text-xs text-text-secondary border-editor-border">
              {wordCount} words
            </Badge>
          </div>
        </>
      ) : (
        // Find & Replace mode
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('formatting')}
            className="h-8 px-2 text-xs hover:bg-editor-surface-hover"
          >
            ← Back
          </Button>

          <div className="flex items-center gap-1 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Find..."
              className="flex-1 h-8 px-2 text-xs bg-editor-surface border border-editor-border rounded"
            />
            <Replace className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Replace..."
              className="flex-1 h-8 px-2 text-xs bg-editor-surface border border-editor-border rounded"
            />
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:bg-editor-surface-hover">
              Find Next
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:bg-editor-surface-hover">
              Replace All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};