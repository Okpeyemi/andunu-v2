import Link from 'next/link';

export default function SolutionSection() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="mx-auto container px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold mt-6 sm:mt-8 md:mt-10 mb-12 sm:mb-16 md:mb-20 px-4">
            Non... Je ne pense pas non.
        </h2>
        <div className="bg-[var(--primary)] rounded-2xl sm:rounded-3xl px-6 sm:px-8 md:px-16 py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="flex flex-col gap-3 text-center md:text-left">
              <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                Avec Andunu, c'est simple et fiable.
              </h4>
            </div>

            {/* Right Button */}
            <Link 
              href="#commencer"
              className="rounded-2xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-primary hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
