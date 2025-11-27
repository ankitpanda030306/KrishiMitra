
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import { Moon, Sun, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUser } from '@/lib/user';
import { useAuth, useFirestore } from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { firebaseUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;
    setIsDeleting(true);
    try {
      // 1. Delete user data from Firestore
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      await deleteDoc(userDocRef);

      // 2. Delete user from Firebase Auth
      await deleteUser(firebaseUser);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      
      router.push('/');
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let description = "An error occurred while deleting your account. Please try again.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This is a sensitive operation. Please log out and log back in before deleting your account.";
      }
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description,
      });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('settingsDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">{t('theme')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('themeDescription')}
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem]"/>
                    <span className="sr-only">Light</span>
                </Button>
                 <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}>
                    <Moon className="h-[1.2rem] w-[1.2rem]"/>
                    <span className="sr-only">Dark</span>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
          <CardDescription>{t('languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-w-xs">
                 <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="hi">{t('hindi')}</SelectItem>
                        <SelectItem value="or">{t('odia')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all of your content. This action is not reversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                 {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
