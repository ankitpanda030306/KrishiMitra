
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import { User, Lock, Mail, Phone, Home, Loader2 } from 'lucide-react';
import {
  useAuth,
  useFirestore,
  setDocumentNonBlocking,
} from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  sendEmailVerification,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);


export function AuthForm() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);

  // Sign up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result);

        if (additionalInfo?.isNewUser) {
            const userProfile = {
                id: user.uid,
                name: user.displayName || 'New User',
                email: user.email || '',
                preferredLanguage: language,
            };
            const userDocRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
        }
        router.push('/dashboard');
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
         if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'The sign-in popup was closed. Please try again.';
        } else if (error.code) {
            errorMessage = error.message;
        }
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: errorMessage,
        })
    } finally {
        setLoading(false);
    }
  }


  const handleAuthAction = async (action: 'login' | 'signup') => {
    setLoading(true);
    try {
      if (action === 'signup') {
        if (!signupEmail || !signupPassword || !signupName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Name, email and password are required for signup.'});
            setLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox to verify your email address before logging in.",
        });

        await updateProfile(user, { displayName: signupName });

        const userProfile = {
            id: user.uid,
            name: signupName,
            email: signupEmail,
            phone: signupPhone,
            address: signupAddress,
            preferredLanguage: language,
        };
        
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

        // Don't auto-login, user needs to verify first.
        // Optionally, you can switch tabs or clear the form.

      } else { // Login
        if (!loginEmail || !loginPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required for login.'});
            setLoading(false);
            return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        if (!userCredential.user.emailVerified) {
            toast({
              variant: "destructive",
              title: "Email Not Verified",
              description: "Please verify your email address before logging in. Check your inbox for the verification link.",
            });
            // We're already catching this, so we need to rethrow to prevent router push
            throw new Error("Email not verified");
        }
        router.push('/dashboard');
      }
    } catch (error: any) {
        if (error.message === "Email not verified") {
            // This is our custom error, do nothing more.
            return;
        }
        let errorMessage = "An unknown error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid credentials. Please check your email and password.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. Please use at least 6 characters.';
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: errorMessage,
        })
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div id="recaptcha-container"></div>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold font-headline">{t('getStarted')}</h2>
        <p className="text-muted-foreground">{t('createAccount')}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">{t('selectLanguage')}</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="hi">{t('hindi')}</SelectItem>
              <SelectItem value="or">{t('odia')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">{t('createAccount')}</TabsTrigger>
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signup" className="space-y-4 pt-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name-signup" placeholder={t('name')} className="pl-9" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email-signup" type="email" placeholder={t('email')} className="pl-9" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password-signup" type="password" placeholder={t('password')} className="pl-9" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
          </div>
           <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="address-signup" placeholder={t('address')} className="pl-9" value={signupAddress} onChange={(e) => setSignupAddress(e.target.value)} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="phone-signup" type="tel" placeholder={t('phone')} className="pl-9" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />
          </div>

          <Button onClick={() => handleAuthAction('signup')} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('createAccount')}
          </Button>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
           <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
        </TabsContent>
        <TabsContent value="login" className="space-y-4 pt-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email-login" type="email" placeholder={t('email')} className="pl-9" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password-login" type="password" placeholder={t('password')} className="pl-9" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
          </div>
          <Button onClick={() => handleAuthAction('login')} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('login')}
          </Button>
           <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
           <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
