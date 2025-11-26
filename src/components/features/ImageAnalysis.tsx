
"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import { Upload, Microscope, ClipboardList, Package, AlertTriangle, Loader2, Camera, Video } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { analyzeCropImageForDefects, AnalyzeCropImageForDefectsOutput } from '@/ai/flows/analyze-crop-image-for-defects';
import { recommendSortingGradesForHarvest, RecommendSortingGradesForHarvestOutput } from '@/ai/flows/recommend-sorting-grades-for-harvest';
import { suggestStorageInstructions, SuggestStorageInstructionsOutput } from '@/ai/flows/suggest-storage-instructions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type Step = 'idle' | 'analyzing' | 'analyzed' | 'sorting' | 'sorted' | 'storing' | 'stored';
type InputMode = 'upload' | 'camera';

export default function ImageAnalysis() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Tomato');
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalyzeCropImageForDefectsOutput | null>(null);
  const [sortingResult, setSortingResult] = useState<RecommendSortingGradesForHarvestOutput | null>(null);
  const [storageResult, setStorageResult] = useState<SuggestStorageInstructionsOutput | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'crop-analysis-placeholder');

  useEffect(() => {
    const getCameraPermission = async () => {
      if (inputMode !== 'camera') {
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        return;
      };
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Not Supported",
          description: "Your browser does not support camera access.",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop video stream when component unmounts or mode changes
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [inputMode, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        setImageDataUri(dataUrl);
        resetAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        setImageDataUri(dataUrl);
        resetAnalysis();
      }
    }
  };

  const resetAnalysis = () => {
    setStep('idle');
    setAnalysisResult(null);
    setSortingResult(null);
    setStorageResult(null);
    setError(null);
  };


  const handleAnalyze = async () => {
    if (!imageDataUri) return;
    setStep('analyzing');
    setError(null);
    try {
      const result = await analyzeCropImageForDefects({ photoDataUri: imageDataUri });
      setAnalysisResult(result);
      setStep('analyzed');
    } catch (e) {
      setError('Failed to analyze image.');
      toast({ variant: 'destructive', title: 'Analysis Error', description: 'Could not analyze the crop image.' });
      setStep('idle');
    }
  };

  const handleSort = async () => {
    if (!imageDataUri || !analysisResult) return;
    setStep('sorting');
    setError(null);
    try {
      const qualityDescription = analysisResult.defects.join(', ') || 'Good quality';
      const result = await recommendSortingGradesForHarvest({
        cropType,
        qualityDescription,
        harvestPhotoDataUri: imageDataUri,
      });
      setSortingResult(result);
      setStep('sorted');
    } catch (e) {
      setError('Failed to get sorting recommendations.');
      toast({ variant: 'destructive', title: 'Sorting Error', description: 'Could not get sorting recommendations.' });
      setStep('analyzed');
    }
  };

  const handleStorage = async () => {
    if (!sortingResult) return;
    setStep('storing');
    setError(null);
    try {
      // Mocked data for weather and location
      const quality = sortingResult.sortingRecommendations[0]?.grade || 'market-ready';
      const weatherConditions = 'Sunny, 25°C, 60% humidity';
      const location = '19.0760,72.8777';
      const result = await suggestStorageInstructions({ quality, weatherConditions, location });
      setStorageResult(result);
      setStep('stored');
    } catch (e) {
      setError('Failed to get storage instructions.');
      toast({ variant: 'destructive', title: 'Storage Error', description: 'Could not get storage instructions.' });
      setStep('sorted');
    }
  };

  const isLoading = ['analyzing', 'sorting', 'storing'].includes(step);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline">{t('analyzeYourCrop')}</CardTitle>
        <CardDescription>{t('uploadImageToGetStarted')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload File</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" /> Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-[4/3] relative bg-muted rounded-md overflow-hidden">
                    <Image
                      src={imagePreview || placeholderImage?.imageUrl || ''}
                      alt="Crop to be analyzed"
                      fill
                      className="object-contain"
                      data-ai-hint={imagePreview ? 'uploaded crop' : placeholderImage?.imageHint}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="camera">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-[4/3] relative bg-muted rounded-md overflow-hidden">
                    {hasCameraPermission === false && (
                       <div className="w-full h-full flex flex-col items-center justify-center text-center">
                          <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>
                                Please allow camera access to use this feature. Check your browser settings.
                              </AlertDescription>
                          </Alert>
                       </div>
                    )}
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <Button onClick={handleCapture} disabled={hasCameraPermission !== true} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className='space-y-2'>
              <Label htmlFor="crop-type">Crop Type</Label>
              <Input id="crop-type" value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="e.g., Tomato" />
            </div>
            {inputMode === 'upload' && (
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="block">Image File</Label>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadImage')}
                </Button>
                <Input ref={fileInputRef} id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}
          </div>
           {imagePreview && inputMode === 'camera' && (
            <Card>
                <CardHeader><CardTitle className="text-lg">Captured Image</CardTitle></CardHeader>
                <CardContent>
                    <div className="aspect-[4/3] relative bg-muted rounded-md overflow-hidden">
                        <Image src={imagePreview} alt="Captured crop" fill className="object-contain" />
                    </div>
                </CardContent>
            </Card>
           )}
        </div>
        <div className="space-y-6">
          {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-3"><AlertTriangle /> {error}</div>}
          
          <div className="space-y-2">
            <Button onClick={handleAnalyze} disabled={!imageDataUri || isLoading} className="w-full">
              {step === 'analyzing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Microscope className="mr-2 h-4 w-4" />
              {t('analysisResults')}
            </Button>
            {analysisResult && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Analysis</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.defects.map((defect, i) => (
                      <li key={i} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{defect}</span>
                          <Badge variant="secondary">{Math.round(analysisResult.confidenceScores[i] * 100)}%</Badge>
                        </div>
                        <Progress value={analysisResult.confidenceScores[i] * 100} />
                      </li>
                    ))}
                    {analysisResult.defects.length === 0 && <p className="text-muted-foreground">No defects found.</p>}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleSort} disabled={step !== 'analyzed' || isLoading} className="w-full">
              {step === 'sorting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ClipboardList className="mr-2 h-4 w-4" />
              {t('sortingRecommendations')}
            </Button>
            {sortingResult && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Sorting</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {sortingResult.sortingRecommendations.map((rec, i) => (
                    <div key={i}>
                      <Badge className="bg-accent text-accent-foreground mb-1">{rec.grade}</Badge>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleStorage} disabled={step !== 'sorted' || isLoading} className="w-full">
              {step === 'storing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Package className="mr-2 h-4 w-4" />
              {t('storageInstructions')}
            </Button>
            {storageResult && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Storage</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">{storageResult.storageInstructions}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
