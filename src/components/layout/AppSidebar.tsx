
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Mic,
  Gem,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useUser } from '@/lib/user';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard', plan: 'free' },
  { href: '/dashboard/freemium', icon: LayoutDashboard, labelKey: 'dashboard', plan: 'freemium'},
  { href: '/dashboard/premium', icon: LayoutDashboard, labelKey: 'dashboard', plan: 'premium'},
  { href: '/dashboard/image-analysis', icon: Scan, labelKey: 'imageAnalysis' },
  { href: '/dashboard/voice-analysis', icon: Mic, labelKey: 'useVoiceInput' },
  { href: '/dashboard/market-connect', icon: Store, labelKey: 'marketConnect' },
  { href: '/dashboard/pest-patrol', icon: Bug, labelKey: 'pestPatrol' },
  { href: '/dashboard/pricing', icon: Gem, labelKey: 'pricing' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { subscriptionPlan } = useUser();
  
  const handleLogout = () => {
    signOut(auth);
    router.push('/');
  }

  const getDashboardPath = () => {
    switch (subscriptionPlan) {
      case 'premium':
        return '/dashboard/premium';
      case 'freemium':
        return '/dashboard/freemium';
      default:
        return '/dashboard';
    }
  };

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
          {navItems.map((item) => {
            let href = item.href;
            if (item.labelKey === 'dashboard') {
              // Skip rendering the non-relevant dashboard links
              if (item.plan !== subscriptionPlan && (item.plan !== 'free' || (subscriptionPlan !== 'free' && subscriptionPlan))) {
                 return null;
              }
              href = getDashboardPath();
            }

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href}
                  tooltip={{ children: t(item.labelKey as any) }}
                >
                  <Link href={href}>
                    <item.icon />
                    <span>{t(item.labelKey as any)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
            <SidebarMenuButton asChild tooltip={{ children: t('settings') }} isActive={pathname === '/dashboard/settings'}>
              <Link href="/dashboard/settings">
                <Settings />
                <span>{t('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t('logout') }}>
              <LogOut />
              <span>{t('logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
