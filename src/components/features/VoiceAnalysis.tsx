'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { Mic, MicOff, AlertTriangle, Loader2, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVoiceCondition, VoiceConditionOutput } from '@/ai/flows/voice-based-condition-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'analyzing' | 'analyzed';

export default function VoiceAnalysis() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceConditionOutput | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    // Get user location for more accurate advisories
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => {
          // You can optionally notify the user that location makes results better
          console.warn('Location access denied. Voice analysis may be less accurate.');
        }
      );
    }
  }, []);

  const requestMicPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasMicPermission(false);
      setError(t('micNotSupported'));
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setHasMicPermission(false);
      setError(t('micAccessDenied'));
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await requestMicPermission();
    if (!stream) return;

    setRecordingState('recording');
    setAnalysisResult(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setRecordingState('recorded');
      // Stop all media tracks to turn off the mic indicator
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAnalyze = async () => {
    if (!audioUrl) return;

    setRecordingState('analyzing');
    setError(null);

    try {
      // We need to convert the blob to a base64 data URI to send to the flow
      const blob = await fetch(audioUrl).then(r => r.blob());
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Pass location if available
        const result = await analyzeVoiceCondition({
          voiceDescription: base64data,
          ...(location && { location }),
        });

        setAnalysisResult(result);
        setRecordingState('analyzed');
      };
    } catch (e: any) {
      console.error(e);
      let errorMsg = t('analysisErrorDescription');
      if (e.message && e.message.includes('model is overloaded')) {
          errorMsg = t('aiServiceOverloaded');
      }
      setError(errorMsg);
      toast({ variant: 'destructive', title: t('analysisErrorTitle'), description: errorMsg });
      setRecordingState('recorded');
    }
  };
  
  const isLoading = recordingState === 'analyzing';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">{t('useVoiceInput')}</CardTitle>
          <CardDescription>{t('voiceInputDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-8">
            {hasMicPermission === false && error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('micErrorTitle')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {recordingState === 'idle' && (
                <Button size="lg" onClick={startRecording} className="w-48">
                    <Mic className="mr-2 h-5 w-5" />
                    {t('startRecording')}
                </Button>
            )}

            {recordingState === 'recording' && (
                <Button size="lg" variant="destructive" onClick={stopRecording} className="w-48">
                    <Square className="mr-2 h-5 w-5" />
                    {t('stopRecording')}
                </Button>
            )}

            {(recordingState === 'recorded' || recordingState === 'analyzing' || recordingState === 'analyzed') && (
                <div className="w-full space-y-4">
                    <audio ref={audioRef} src={audioUrl || ''} controls className="w-full" />
                    <div className="flex gap-4">
                        <Button onClick={startRecording} variant="outline" className="w-full">
                            <MicOff className="mr-2 h-4 w-4" />
                            {t('recordAgain')}
                        </Button>
                        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            {t('analyzeRecording')}
                        </Button>
                    </div>
                </div>
            )}
            
            {recordingState === 'recording' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                <p>{t('recordingInProgress')}</p>
              </div>
            )}

        </CardContent>
      </Card>
      
      {isLoading && (
         <Card>
            <CardContent className="p-6 flex items-center justify-center gap-4">
               <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('analyzing')}</p>
            </CardContent>
         </Card>
      )}

      {error && recordingState !== 'idle' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {analysisResult && recordingState === 'analyzed' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analysisResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysisResult.recommendations}</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
