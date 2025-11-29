
"use client";

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { ClipboardList, Loader2, IndianRupee, Trash2, Calendar as CalendarIcon, PlusCircle, TrendingUp, TrendingDown, Wand2, AlertTriangle } from 'lucide-react';
import { useUser } from '@/lib/user';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getExpenseReductionAdvice, GetExpenseReductionAdviceOutput } from '@/ai/flows/get-expense-reduction-advice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const seasonSchema = z.object({
  name: z.string().min(3, "Season name is required."),
  cropType: z.string().min(2, "Crop type is required."),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
  expectedRevenue: z.coerce.number().min(0).optional(),
});
type SeasonFormValues = z.infer<typeof seasonSchema>;

const expenseSchema = z.object({
    type: z.string().min(1, "Expense type is required."),
    amount: z.coerce.number().min(1, "Amount must be greater than 0."),
    date: z.date({ required_error: "Expense date is required." }),
    description: z.string().optional(),
});
type ExpenseFormValues = z.infer<typeof expenseSchema>;

const expenseTypes = ["Seeds", "Fertilizer", "Labor", "Pesticides", "Machinery", "Other"];

export default function ExpenseManagerPage() {
  const { t, language } = useLanguage();
  const { firebaseUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<GetExpenseReductionAdviceOutput | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const seasonForm = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
  });

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
  });

  // Fetch Seasons
  const seasonsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(
        collection(firestore, `users/${firebaseUser.uid}/cropSeasons`), 
        orderBy('startDate', 'desc')
    );
  }, [firestore, firebaseUser]);
  const { data: seasons, isLoading: seasonsLoading } = useCollection(seasonsQuery);

  // Fetch Expenses for selected season
  const expensesQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser || !selectedSeasonId) return null;
    return query(
        collection(firestore, `users/${firebaseUser.uid}/expenses`),
        where('cropSeasonId', '==', selectedSeasonId),
        orderBy('date', 'desc')
    );
  }, [firestore, firebaseUser, selectedSeasonId]);
  const { data: expenses, isLoading: expensesLoading } = useCollection(expensesQuery);
  
  const selectedSeason = useMemo(() => {
    return seasons?.find(s => s.id === selectedSeasonId);
  }, [seasons, selectedSeasonId]);


  const onSeasonSubmit = async (data: SeasonFormValues) => {
    if (!firebaseUser) return;
    const seasonsColRef = collection(firestore, `users/${firebaseUser.uid}/cropSeasons`);
    addDocumentNonBlocking(seasonsColRef, {
      userProfileId: firebaseUser.uid,
      name: data.name,
      cropType: data.cropType,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
      expectedRevenue: data.expectedRevenue || 0,
    }).then(() => {
      toast({ title: t('seasonAdded') });
      seasonForm.reset();
    });
  };
  
  const onExpenseSubmit = async (data: ExpenseFormValues) => {
    if (!firebaseUser || !selectedSeasonId) return;
    const expensesColRef = collection(firestore, `users/${firebaseUser.uid}/expenses`);
    addDocumentNonBlocking(expensesColRef, {
      userProfileId: firebaseUser.uid,
      cropSeasonId: selectedSeasonId,
      type: data.type,
      amount: data.amount,
      date: Timestamp.fromDate(data.date),
      description: data.description || '',
    }).then(() => {
      toast({ title: t('expenseAdded') });
      expenseForm.reset();
      // Reset advice when a new expense is added
      setAdvice(null); 
      setAdviceError(null);
    });
  };

  const deleteExpense = (expenseId: string) => {
    if (!firebaseUser) return;
    const expenseDocRef = doc(firestore, `users/${firebaseUser.uid}/expenses/${expenseId}`);
    deleteDocumentNonBlocking(expenseDocRef).then(() => {
        toast({ title: t('expenseDeleted') });
    });
  };

  const { totalExpenses, netProfit, seasonRevenue } = useMemo(() => {
    const total = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const revenue = selectedSeason?.expectedRevenue || 0;
    return {
      totalExpenses: total,
      seasonRevenue: revenue,
      netProfit: revenue - total,
    };
  }, [expenses, selectedSeason]);

  const handleGetAdvice = async () => {
      if (!expenses || expenses.length === 0 || !selectedSeason) return;

      setAdviceLoading(true);
      setAdviceError(null);
      setAdvice(null);
      try {
        const result = await getExpenseReductionAdvice({
            cropType: selectedSeason.cropType,
            totalExpenses: totalExpenses,
            expectedRevenue: seasonRevenue,
            expenses: expenses.map(e => ({ type: e.type, amount: e.amount })),
            language: language,
        });
        setAdvice(result);
      } catch (e: any) {
        setAdviceError("Failed to get AI advice. Please try again.");
        console.error("Failed to get expense advice:", e);
      } finally {
        setAdviceLoading(false);
      }
  }

  // Clear advice when season changes
  useEffect(() => {
    setAdvice(null);
    setAdviceError(null);
  }, [selectedSeasonId]);


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          {t('farmExpenseManager')}
        </h1>
        <p className="text-muted-foreground">{t('expenseManagerDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader><CardTitle>{t('manageSeasons')}</CardTitle></CardHeader>
            <CardContent>
              <Form {...seasonForm}>
                <form onSubmit={seasonForm.handleSubmit(onSeasonSubmit)} className="space-y-4">
                  <FormField control={seasonForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('seasonName')}</FormLabel><FormControl><Input placeholder={t('egKharif2024')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={seasonForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>{t('cropType')}</FormLabel><FormControl><Input placeholder={t('egTomatoes')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={seasonForm.control} name="startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('startDate')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={seasonForm.control} name="expectedRevenue" render={({ field }) => (<FormItem><FormLabel>{t('expectedRevenue')}</FormLabel><FormControl><Input type="number" placeholder="e.g., 150000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={seasonForm.formState.isSubmitting} className="w-full">{seasonForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('addSeason')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Select onValueChange={setSelectedSeasonId} value={selectedSeasonId || ""}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder={t('selectASeason')} />
                </SelectTrigger>
                <SelectContent>
                  {seasons?.map(season => <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            {!selectedSeasonId && (
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-16">
                    <p className="text-muted-foreground max-w-sm">{seasonsLoading ? 'Loading seasons...' : t('noSeasonsYet')}</p>
                </CardContent>
            )}
            {selectedSeasonId && (
              <>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">Rs. {totalExpenses.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('expectedRevenue')}</CardTitle><IndianRupee className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">Rs. {seasonRevenue.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card className={cn(netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('netProfitLoss')}</CardTitle>{netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}</CardHeader>
                        <CardContent><div className={cn("text-2xl font-bold", netProfit >= 0 ? 'text-green-600' : 'text-red-600')}>Rs. {netProfit.toLocaleString()}</div></CardContent>
                    </Card>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-4">
                    <Card className="w-full">
                        <CardHeader><CardTitle className="text-lg flex items-center justify-between">{t('aiRecommendations')} <Button size="sm" onClick={handleGetAdvice} disabled={adviceLoading || !expenses || expenses.length === 0}><Wand2 className="mr-2 h-4 w-4" />{adviceLoading ? t('generating') : t('getAdvice')}</Button></CardTitle></CardHeader>
                        <CardContent>
                             {adviceLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> {t('generatingAdvice')}</div>}
                             {adviceError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('error')}</AlertTitle><AlertDescription>{adviceError}</AlertDescription></Alert>}
                             {advice && <div className="prose prose-sm dark:prose-invert text-card-foreground" dangerouslySetInnerHTML={{ __html: advice.advice.replace(/\n/g, '<br/>') }} />}
                             {!adviceLoading && !adviceError && !advice && <p className="text-muted-foreground">{t('getAdviceDescription')}</p>}
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PlusCircle className="w-5 h-5"/>{t('addExpense')}</CardTitle></CardHeader>
                        <CardContent>
                             <Form {...expenseForm}>
                                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="grid md:grid-cols-2 gap-4 items-start">
                                    <FormField control={expenseForm.control} name="type" render={({ field }) => (<FormItem><FormLabel>{t('expenseType')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('selectType')} /></SelectTrigger></FormControl><SelectContent>{expenseTypes.map(type => (<SelectItem key={type} value={type}>{t(type.toLowerCase() as any)}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={expenseForm.control} name="amount" render={({ field }) => (<FormItem><FormLabel>{t('expenseAmount')}</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={expenseForm.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('expenseDate')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                    <FormField control={expenseForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('description')}</FormLabel><FormControl><Input placeholder={t('egBoughtUrea')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="submit" disabled={expenseForm.formState.isSubmitting} className="md:col-span-2">{expenseForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('addExpense')}</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    
                    <Card className="w-full">
                        <CardHeader><CardTitle className="text-lg">{t('recentExpenses')}</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>{t('date')}</TableHead><TableHead>{t('type')}</TableHead><TableHead>{t('description')}</TableHead><TableHead className="text-right">{t('amount')}</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                                <TableBody>
                                {expensesLoading && [...Array(3)].map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))}
                                {!expensesLoading && expenses?.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell>{format(exp.date.toDate(), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>{t(exp.type.toLowerCase() as any)}</TableCell>
                                        <TableCell>{exp.description}</TableCell>
                                        <TableCell className="text-right">Rs. {exp.amount.toLocaleString()}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => deleteExpense(exp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                                    </TableRow>
                                ))}
                                {!expensesLoading && expenses?.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('noExpensesYet')}</TableCell></TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
