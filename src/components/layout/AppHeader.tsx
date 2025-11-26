
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

export default function AppHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { name } = useUser();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const getInitials = (name: string) => {
    if (!name) return t('farmer').charAt(0);
    const parts = name.split(' ');
    if (parts.length > 1 && parts[parts.length -1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if(name.length > 1) {
      return name.substring(0, 2).toUpperCase();
    }
    return name.toUpperCase();
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
                <p className="text-sm font-medium leading-none">{name || t('farmer')}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  farmer@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

    