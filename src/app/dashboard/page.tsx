import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import LocationAdvisories from '@/components/dashboard/LocationAdvisories';
import PestPatrolSummary from '@/components/dashboard/PestPatrolSummary';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <LocationAdvisories />
        </div>
        <div className="lg:col-span-1">
          <PestPatrolSummary />
        </div>
      </div>
    </div>
  );
}
