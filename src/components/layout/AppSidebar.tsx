"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Scan,
  Store,
  Bug,
  Leaf,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/dashboard/image-analysis', icon: Scan, labelKey: 'imageAnalysis' },
  { href: '/dashboard/market-connect', icon: Store, labelKey: 'marketConnect' },
  { href: '/dashboard/pest-patrol', icon: Bug, labelKey: 'pestPatrol' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Leaf className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-semibold font-headline whitespace-nowrap group-data-[collapsible=icon]:hidden">
            Krishi Mitra
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: t(item.labelKey as any) }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{t(item.labelKey as any)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip={{ children: t('profile') }} isActive={pathname === '/dashboard/profile'}>
                <Link href="/dashboard/profile">
                  <User />
                  <span>{t('profile')}</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: t('settings') }}>
              <Settings />
              <span>{t('settings')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: t('logout') }}>
              <Link href="/">
                <LogOut />
                <span>{t('logout')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
