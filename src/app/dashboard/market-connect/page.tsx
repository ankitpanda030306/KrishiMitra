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
  { id: 1, crop: 'Tomatoes', grade: 'Premium', quantity: '50kg', price: '₹30/kg', farmer: 'R. Sharma', location: 'Nashik' },
  { id: 2, crop: 'Potatoes', grade: 'Market-Ready', quantity: '200kg', price: '₹15/kg', farmer: 'A. Patel', location: 'Indore' },
  { id: 3, crop: 'Onions', grade: 'Premium', quantity: '150kg', price: '₹25/kg', farmer: 'S. Singh', location: 'Alwar' },
  { id: 4, crop: 'Apples', grade: 'Processing', quantity: '500kg', price: '₹40/kg', farmer: 'K. Devi', location: 'Shimla' },
];

const mockRates = [
  { crop: 'Tomatoes', premium: '₹30-35/kg', market: '₹20-25/kg' },
  { crop: 'Potatoes', premium: '₹18-22/kg', market: '₹12-16/kg' },
  { crop: 'Onions', premium: '₹25-30/kg', market: '₹15-20/kg' },
];

export default function MarketConnectPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('marketConnect')}</h1>
        <p className="text-muted-foreground">Connect with local businesses and get market insights.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('listNewHarvest')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Input id="crop" placeholder="e.g., Tomatoes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" placeholder="e.g., Premium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (in kg)</Label>
                <Input id="quantity" type="number" placeholder="e.g., 50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per kg (₹)</Label>
                <Input id="price" type="number" placeholder="e.g., 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="e.g., Organic, available next week" />
              </div>
              <Button className="w-full">{t('listNewHarvest')}</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('currentMarketListings')}</CardTitle>
              <CardDescription>Harvests available from farmers in your region.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Farmer</TableHead>
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
                      <TableCell>{listing.price}</TableCell>
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
              <CardDescription>Average market rates based on quality grades.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead>Premium Grade</TableHead>
                    <TableHead>Market-Ready Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRates.map((rate, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rate.crop}</TableCell>
                      <TableCell>{rate.premium}</TableCell>
                      <TableCell>{rate.market}</TableCell>
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
