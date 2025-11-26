import Image from 'next/image';
import { AuthForm } from '@/components/auth/AuthForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Leaf } from 'lucide-react';

export default function Home() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-background');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 lg:p-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-card">
        <div className="relative hidden lg:block">
          {loginImage && (
            <Image
              src={loginImage.imageUrl}
              alt={loginImage.description}
              fill
              className="object-cover"
              data-ai-hint={loginImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <div className="flex items-center gap-3">
              <Leaf className="w-12 h-12 text-primary" />
              <h1 className="text-5xl font-bold font-headline">Krishi Mitra</h1>
            </div>
            <p className="mt-2 text-lg max-w-md">
              Your AI-powered companion for smarter farming.
            </p>
          </div>
        </div>
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Krishi Mitra</h1>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
