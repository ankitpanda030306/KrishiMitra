
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/user';
import { seedInitialData } from '@/lib/seed';

const mockRates = [
  { crop: 'Tomatoes', premium: '30-35/kg', market: '20-25/kg' },
  { crop: 'Potatoes', premium: '18-22/kg', market: '12-16/kg' },
  { crop: 'Onions', premium: '25-30/kg', market: '15-20/kg' },
];

export default function MarketConnectPage() {
  const { t } = useLanguage();
  const rupeeSymbol = 'Rs.';
  const { firebaseUser, isUserLoading, name: currentUserName } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [crop, setCrop] = useState('');
  const [grade, setGrade] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seed data only once
  useEffect(() => {
    const seedData = async () => {
      if (firestore) {
        // Check if there are any documents at all.
        const listingsColRef = collection(firestore, `harvestListings`);
        const snapshot = await getDocs(listingsColRef);
        if (snapshot.empty) {
          await seedInitialData(firestore);
        }
      }
    };
    seedData();
  }, [firestore]);


  const harvestListingsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    const listingsColRef = collection(
      firestore,
      `harvestListings`
    );
    return query(listingsColRef, orderBy('availableFrom', 'desc'));
  }, [firestore, firebaseUser]);

  const {
    data: harvestListings,
    isLoading: areListingsLoading,
  } = useCollection(harvestListingsQuery);

  const handleListHarvest = async () => {
    if (!crop || !grade || !quantity || !price) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields to list your harvest.',
      });
      return;
    }
    if (!firebaseUser) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to list a harvest.',
      });
      return;
    }

    setIsSubmitting(true);

    const newListing = {
      userProfileId: firebaseUser.uid,
      userName: currentUserName || 'Anonymous Farmer',
      cropType: crop,
      qualityGrade: grade,
      quantity: Number(quantity),
      pricePerKg: Number(price),
      notes: notes,
      location: 'user_location', // Placeholder
      availableFrom: serverTimestamp(),
      isSeed: false,
    };

    const listingsColRef = collection(firestore, `harvestListings`);
    addDocumentNonBlocking(listingsColRef, newListing)
        .then(() => {
            toast({
                title: 'Harvest Listed!',
                description: `${quantity}kg of ${crop} has been listed successfully.`,
            });
            // Reset form
            setCrop('');
            setGrade('');
            setQuantity('');
            setPrice('');
            setNotes('');
        })
        .catch((e: any) => {
             toast({
                variant: "destructive",
                title: "Listing Failed",
                description: "Could not list harvest. Check permissions.",
            });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };
  
  const canSubmit = !isSubmitting && !isUserLoading && !!firebaseUser;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('marketConnect')}</h1>
        <p className="text-muted-foreground">
          {t('marketConnectDescription')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('listNewHarvest')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop">{t('cropType')}</Label>
                <Input
                  id="crop"
                  placeholder={t('egTomatoes')}
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  disabled={!canSubmit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">{t('grade')}</Label>
                <Input
                  id="grade"
                  placeholder={t('egPremium')}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={!canSubmit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('quantityInKg')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder={t('eg50')}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={!canSubmit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{t('pricePerKg')}</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder={t('eg30')}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={!canSubmit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('additionalNotes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('egOrganic')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canSubmit}
                />
              </div>
              <Button
                onClick={handleListHarvest}
                disabled={!canSubmit}
                className="w-full"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('listNewHarvest')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('currentMarketListings')}</CardTitle>
              <CardDescription>{t('harvestsFromRegion')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crop')}</TableHead>
                    <TableHead>{t('grade')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                    <TableHead>{t('price')}</TableHead>
                    <TableHead>{t('farmer')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areListingsLoading &&
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!areListingsLoading &&
                    harvestListings &&
                    harvestListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          {listing.cropType}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              listing.qualityGrade === 'Premium'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              listing.qualityGrade === 'Premium'
                                ? 'bg-accent text-accent-foreground'
                                : ''
                            }
                          >
                            {listing.qualityGrade}
                          </Badge>
                        </TableCell>
                        <TableCell>{listing.quantity}kg</TableCell>
                        <TableCell>
                          {rupeeSymbol}
                          {listing.pricePerKg}/kg
                        </TableCell>
                        <TableCell>{listing.userProfileId === firebaseUser?.uid ? 'You' : listing.userName}</TableCell>
                      </TableRow>
                    ))}
                  {!areListingsLoading &&
                    (!harvestListings || harvestListings.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No harvest listings available yet.
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('marketRates')}</CardTitle>
              <CardDescription>{t('averageMarketRates')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crop')}</TableHead>
                    <TableHead>{t('premiumGrade')}</TableHead>
                    <TableHead>{t('marketReadyGrade')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRates.map((rate, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rate.crop}</TableCell>
                      <TableCell>
                        {rupeeSymbol}
                        {rate.premium}
                      </TableCell>
                      <TableCell>
                        {rupeeSymbol}
                        {rate.market}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    