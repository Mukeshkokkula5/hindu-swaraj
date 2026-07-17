import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ActivitiesEvents from '@/components/ActivitiesEvents';
import DonationSection from '@/components/DonationSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ActivitiesEvents />
        <DonationSection />
      </main>
      <Footer />
    </>
  );
}

