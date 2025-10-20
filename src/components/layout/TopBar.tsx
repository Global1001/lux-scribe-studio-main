import React from 'react';
import { FileText, Menu, Settings, User, Sun, Moon, Coins, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  onToggleFiles: () => void;
  isFilesOpen: boolean;
  onToggleBottomBar: () => void;
  isBottomBarOpen: boolean;
  onToggleAIPanel: () => void;
  isAIPanelOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onToggleFiles, 
  isFilesOpen,
  onToggleBottomBar,
  isBottomBarOpen,
  onToggleAIPanel,
  isAIPanelOpen
}) => {
  const [isDark, setIsDark] = React.useState(true);
  const { profile, signOut, isAuthenticated } = useAuth();

  React.useEffect(() => {
    // Set dark mode as default on mount
    const savedTheme = localStorage.getItem('theme');
    const defaultDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDark(defaultDark);
    document.documentElement.classList.toggle('dark', defaultDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('theme-toggled', {
      detail: newIsDark ? 'dark' : 'light'
    }));
  };

  return (
    <div className="flex items-center justify-between h-12 px-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFiles}
          className="hover:bg-editor-surface-hover"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <img 
            src={isDark ? "/lovable-uploads/a375d6de-8081-4a35-b495-dc7952776b47.png" : "/lovable-uploads/7835faf8-3408-4d06-93b5-edfb87f24ebb.png"} 
            alt="LuxScribe Logo" 
            className="h-5 w-5" 
          />
          <span className="font-medium text-text-primary">LuxScribe</span>
        </div>
      </div>

      {/* Center section - Breadcrumb */}
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-text-primary">Untitled Document</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFiles}
          className={`relative w-8 h-8 p-0 hover:bg-editor-surface-hover ${isFilesOpen ? 'bg-accent-blue-light' : ''}`}
          title="Toggle Files Panel (Ctrl+Alt+Shift+B)"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current rounded-sm relative">
              <div className={`absolute top-0 left-0 w-1 h-full ${isFilesOpen ? 'bg-accent-blue' : 'bg-text-muted'}`}></div>
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAIPanel}
          className={`relative w-8 h-8 p-0 hover:bg-editor-surface-hover ${isAIPanelOpen ? 'bg-accent-blue-light' : ''}`}
          title="Toggle AI Panel (Ctrl+Alt+B)"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current rounded-sm relative">
              <div className={`absolute top-0 right-0 w-1 h-full ${isAIPanelOpen ? 'bg-accent-blue' : 'bg-text-muted'}`}></div>
            </div>
          </div>
        </Button>

        {/* Credits Display */}
        {isAuthenticated && profile && (
          <Badge variant="secondary" className="flex items-center gap-1 bg-accent-blue-light text-accent-blue">
            <Coins className="h-3 w-3" />
            {profile.credits}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="hover:bg-editor-surface-hover"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-editor-surface-hover">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-accent-blue text-text-inverse">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {isAuthenticated ? (
              <>
                <div className="px-2 py-1.5 text-sm text-text-secondary">
                  {profile?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem>
                <span>Sign in</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};