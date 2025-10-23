import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhySection from '@/components/WhySection';
import SolutionSection from '@/components/SolutionSection';
import UniqueSection from '@/components/UniqueSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div>
      <Header />
      <main className="pt-[88px]">
        <HeroSection />
        <WhySection />
        <SolutionSection />
        <UniqueSection />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}
