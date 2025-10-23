import Link from 'next/link';

export default function SolutionSection() {
  return (
    <section className="w-full bg-white py-20 md:py-32">
      <div className="mx-auto container px-6">
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mt-10 mb-20">
            Non... Je ne pense pas non.
        </h2>
        <div className="bg-[var(--primary)] rounded-3xl px-8 md:px-16 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="flex flex-col gap-3">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                Avec Andunu, c'est simple et fiable.
              </h4>
            </div>

            {/* Right Button */}
            <Link 
              href="#commencer"
              className="rounded-2xl bg-white px-8 py-4 text-base font-medium text-primary hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
