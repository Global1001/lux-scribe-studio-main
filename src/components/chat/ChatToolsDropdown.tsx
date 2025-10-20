import React from 'react';
import { FileText, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMode } from '@/types/chat';

interface ChatToolsDropdownProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export const ChatToolsDropdown: React.FC<ChatToolsDropdownProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-3 w-3 mr-1" />
          Tools
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>AI Tools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentMode} onValueChange={onModeChange}>
          <DropdownMenuRadioItem value="document">
            <FileText className="h-4 w-4 mr-2" />
            Document Chat
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="research">
            <Globe className="h-4 w-4 mr-2" />
            External Research
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};