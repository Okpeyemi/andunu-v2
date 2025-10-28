import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhySection from '@/components/WhySection';
import SolutionSection from '@/components/SolutionSection';
import UniqueSection from '@/components/UniqueSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';

export default function Home() {
  return (
    <>
      <StructuredData />
      <div>
        <Header />
        <main className="pt-[72px] sm:pt-[80px] md:pt-[88px]">
          <HeroSection />
          <WhySection />
          <SolutionSection />
          <UniqueSection />
          <CTASection />
          <Footer />
        </main>
      </div>
    </>
  );
}
