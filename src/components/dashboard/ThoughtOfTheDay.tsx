
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useLanguage, Language } from '@/lib/i18n';
import { useEffect, useState } from 'react';

type Thought = {
  [key in Language]: string;
};

const thoughts: Thought[] = [
  { en: "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.", hi: "किसान हमारी अर्थव्यवस्था में एकमात्र ऐसा व्यक्ति है जो सब कुछ खुदरा में खरीदता है, सब कुछ थोक में बेचता है, और दोनों तरफ से भाड़ा चुकाता है।", or: "କୃଷକ ଆମ ଅର୍ଥନୀତିରେ ଏକମାତ୍ର ବ୍ୟକ୍ତି ଯିଏ ସବୁକିଛି ରିଟେଲରେ କିଣେ, ସବୁକିଛି ହୋଲସେଲରେ ବିକ୍ରି କରେ, ଏବଂ ଦୁଇ ପଟେ ଭଡ଼ା ଦିଏ।" },
  { en: "To cultivate a garden is to walk with God.", hi: "एक बगीचा लगाना ईश्वर के साथ चलना है।", or: "ଏକ ବଗିଚା ଚାଷ କରିବା ହେଉଛି ଭଗବାନଙ୍କ ସହିତ ଚାଲିବା।" },
  { en: "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.", hi: "खेती का अंतिम लक्ष्य फसल उगाना नहीं, बल्कि इंसानों का विकास और उनकी पूर्णता है।", or: "ଚାଷର ମୂଳ ଲକ୍ଷ୍ୟ ଫସଲ ବଢାଇବା ନୁହେଁ, ବରଂ ମନୁଷ୍ୟର ବିକାଶ ଏବଂ ସିଦ୍ଧି।" },
  { en: "A farmer's hands are a testament to hard work and dedication.", hi: "एक किसान के हाथ कड़ी मेहनत और समर्पण का प्रमाण हैं।", or: "ଜଣେ କୃଷକର ହାତ କଠିନ ପରିଶ୍ରମ ଏବଂ ସମର୍ପଣର ପ୍ରମାଣ ଅଟେ।" },
  { en: "Every seed you plant is a promise of a future harvest.", hi: "आपके द्वारा बोया गया हर बीज भविष्य की फसल का वादा है।", or: "ଆପଣ ବୁଣିଥିବା ପ୍ରତ୍ୟେକ ବୀଜ ଭବିଷ୍ୟତର ଫସଲର ଏକ ପ୍ରତିଜ୍ଞା।" },
  { en: "Farming looks mighty easy when your plow is a pencil, and you’re a thousand miles from the corn field.", hi: "जब आपका हल एक पेंसिल हो, और आप मकई के खेत से एक हजार मील दूर हों, तो खेती बहुत आसान लगती है।", or: "ଯେତେବେଳେ ଆପଣଙ୍କ ହଳ ଏକ ପେନ୍ସିଲ୍, ଏବଂ ଆପଣ ମକା କ୍ଷେତରୁ ହଜାର ମାଇଲ୍ ଦୂରରେ ଥାଆନ୍ତି, ଚାଷ ବହୁତ ସହଜ ଲାଗେ।" },
  { en: "The soil is the great connector of lives, the source and destination of all.", hi: "मिट्टी जीवन का महान संयोजक है, सभी का स्रोत और मंजिल।", or: "ମାଟି ଜୀବନର ମହାନ ସଂଯୋଜକ, ସମସ୍ତଙ୍କର ଉତ୍ସ ଏବଂ ଗନ୍ତବ୍ୟ।" },
  { en: "A good farmer is nothing more nor less than a handy man with a sense of humus.", hi: "एक अच्छा किसान और कुछ नहीं बल्कि हास्य की भावना वाला एक आसान आदमी है।", or: "ଜଣେ ଭଲ କୃଷକ ହେଉଛି ହ୍ୟୁମସର ଭାବନା ଥିବା ଜଣେ ସହଜ ମଣିଷ।" },
  { en: "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals, and happiness.", hi: "कृषि हमारा सबसे बुद्धिमानी भरा पेशा है, क्योंकि यह अंत में वास्तविक धन, अच्छे नैतिकता और खुशी में सबसे अधिक योगदान देगा।", or: "କୃଷି ଆମର ସବୁଠାରୁ ବୁଦ୍ଧିମାନ ଅନୁସରଣ, କାରଣ ଏହା ଶେଷରେ ପ୍ରକୃତ ସମ୍ପଦ, ଭଲ ନୈତିକତା ଏବଂ ସୁଖରେ ସବୁଠାରୁ ଅଧିକ ଯୋଗଦାନ ଦେବ।" },
  { en: "The discovery of agriculture was the first big step toward a civilized life.", hi: "कृषि की खोज सभ्य जीवन की ओर पहला बड़ा कदम था।", or: "କୃଷିର ଆବିଷ୍କାର ସଭ୍ୟ ଜୀବନ ଦିଗରେ ପ୍ରଥମ ବଡ ପଦକ୍ଷେପ ଥିଲା।" }
];


export default function ThoughtOfTheDay() {
  const { language } = useLanguage();
  const [dailyThought, setDailyThought] = useState<string | null>(null);

  useEffect(() => {
    // This logic must run only on the client to avoid hydration mismatch
    const getDayOfYear = (date: Date) => {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    };

    const dayOfYear = getDayOfYear(new Date());
    const thoughtIndex = dayOfYear % thoughts.length;
    const thought = thoughts[thoughtIndex];
    setDailyThought(thought[language] || thought['en']);
  }, [language]);


  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-foreground italic">
                "{dailyThought || 'Loading thought...'}"
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
