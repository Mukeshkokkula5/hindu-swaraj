import EmergencyBloodTicker from '@/components/EmergencyBloodTicker';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import CovidSevaBanner from '@/components/CovidSevaBanner';
import ActivitiesEvents from '@/components/ActivitiesEvents';
import LeadershipSection from '@/components/LeadershipSection';
import BloodHeroesSection from '@/components/BloodHeroesSection';
import GallerySection from '@/components/GallerySection';
import DonationSection from '@/components/DonationSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <EmergencyBloodTicker />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <CovidSevaBanner />
        <ActivitiesEvents />
        <BloodHeroesSection />
        <LeadershipSection />
        <GallerySection />
        <DonationSection />
      </main>
      <Footer />
    </>
  );
}

