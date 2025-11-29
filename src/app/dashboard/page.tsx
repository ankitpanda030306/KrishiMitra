import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import LocationAdvisories from '@/components/dashboard/LocationAdvisories';
import PestPatrolSummary from '@/components/dashboard/PestPatrolSummary';
import LiveWeather from '@/components/dashboard/LiveWeather';
import ThoughtOfTheDay from '@/components/dashboard/ThoughtOfTheDay';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <WelcomeHeader />
      <LiveWeather />
      <ThoughtOfTheDay />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
          <PestPatrolSummary />
        </div>
        <div className="lg:col-span-2">
          <LocationAdvisories />
        </div>
      </div>
    </div>
  );
}
