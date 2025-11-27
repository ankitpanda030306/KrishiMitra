import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-crop-image-for-defects.ts';
import '@/ai/flows/voice-based-condition-analysis.ts';
import '@/ai/flows/recommend-sorting-grades-for-harvest.ts';
import '@/ai/flows/suggest-storage-instructions.ts';
import '@/ai/flows/provide-location-based-advisories.ts';
import '@/ai/flows/transliterate-name.ts';
import '@/ai/flows/get-live-pest-incidents.ts';
