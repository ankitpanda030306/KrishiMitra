
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

const mockListings = [
  { id: 1, crop: 'Tomatoes', grade: 'Premium', quantity: '50kg', price: '30/kg', farmer: 'R. Sharma', location: 'Nashik' },
  { id: 2, crop: 'Potatoes', grade: 'Market-Ready', quantity: '200kg', price: '15/kg', farmer: 'A. Patel', location: 'Indore' },
  { id: 3, crop: 'Onions', grade: 'Premium', quantity: '150kg', price: '25/kg', farmer: 'S. Singh', location: 'Alwar' },
  { id: 4, crop: 'Apples', grade: 'Processing', quantity: '500kg', price: '40/kg', farmer: 'K. Devi', location: 'Shimla' },
];

const mockRates = [
  { crop: 'Tomatoes', premium: '30-35/kg', market: '20-25/kg' },
  { crop: 'Potatoes', premium: '18-22/kg', market: '12-16/kg' },
  { crop: 'Onions', premium: '25-30/kg', market: '15-20/kg' },
];

export default function MarketConnectPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('marketConnect')}</h1>
        <p className="text-muted-foreground">{t('marketConnectDescription')}</p>
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
                <Input id="crop" placeholder={t('egTomatoes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">{t('grade')}</Label>
                <Input id="grade" placeholder={t('egPremium')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('quantityInKg')}</Label>
                <Input id="quantity" type="number" placeholder={t('eg50')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{t('pricePerKg')}</Label>
                <Input id="price" type="number" placeholder={t('eg30')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('additionalNotes')}</Label>
                <Textarea id="notes" placeholder={t('egOrganic')} />
              </div>
              <Button className="w-full">{t('listNewHarvest')}</Button>
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
                  {mockListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.crop}</TableCell>
                      <TableCell>
                        <Badge variant={listing.grade === 'Premium' ? 'default' : 'secondary'} className={listing.grade === 'Premium' ? 'bg-accent text-accent-foreground' : ''}>
                          {listing.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.quantity}</TableCell>
                      <TableCell>₹{listing.price}</TableCell>
                      <TableCell>{listing.farmer} ({listing.location})</TableCell>
                    </TableRow>
                  ))}
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
                      <TableCell>₹{rate.premium}</TableCell>
                      <TableCell>₹{rate.market}</TableCell>
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
