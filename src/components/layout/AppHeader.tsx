"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import Link from 'next/link';
import { useUser } from '@/lib/user';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { name, displayName, email } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };
  
  const handleLogout = () => {
    signOut(auth);
    router.push('/');
  }

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '';
    const parts = nameStr.split(' ');
    // For non-latin scripts, just take the first char.
    if (parts.length > 1 && parts[parts.length -1] && !/^[a-zA-Z0-9]/.test(parts[0][0])) {
      return nameStr.charAt(0);
    }
    if (parts.length > 1 && parts[parts.length -1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if(nameStr.length > 1) {
      return nameStr.substring(0, 2).toUpperCase();
    }
    return nameStr.toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />

      <div className="flex w-full items-center justify-end gap-4">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-auto h-10 border-0 bg-transparent shadow-none focus:ring-0 gap-2">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="en">{t('english')}</SelectItem>
            <SelectItem value="hi">{t('hindi')}</SelectItem>
            <SelectItem value="or">{t('odia')}</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/farmer-avatar/100/100" data-ai-hint="farmer avatar" />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName || name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {email || 'farmer@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
