import ImageAnalysis from "@/components/features/ImageAnalysis";
import { useLanguage } from "@/lib/i18n";

export default function ImageAnalysisPage() {
  // We cannot use the hook here directly because this is a server component.
  // The translations will be passed down to the client component.
  return (
    <div>
      <ImageAnalysis />
    </div>
  );
}
