'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ScaleIn } from './animations';

function TypewriterText() {
  const [firstText, setFirstText] = useState('');
  const [secondText, setSecondText] = useState('');
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);
  
  const text1 = 'Non... ';
  const text2 = 'Je ne pense pas non.';

  useEffect(() => {
    const runAnimation = () => {
      let index = 0;
      setFirstText('');
      setSecondText('');
      setShowCursor1(true);
      setShowCursor2(false);
      
      // Écrire le premier texte
      const interval1 = setInterval(() => {
        if (index < text1.length) {
          setFirstText(text1.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval1);
          setShowCursor1(false);
          
          // Pause de 800ms avant le deuxième texte
          setTimeout(() => {
            setShowCursor2(true);
            let index2 = 0;
            
            // Écrire le deuxième texte
            const interval2 = setInterval(() => {
              if (index2 < text2.length) {
                setSecondText(text2.slice(0, index2 + 1));
                index2++;
              } else {
                clearInterval(interval2);
                setShowCursor2(false);
                
                // Pause de 2 secondes avant de recommencer
                setTimeout(() => {
                  runAnimation();
                }, 2000);
              }
            }, 50);
          }, 800);
        }
      }, 100);
    };

    runAnimation();
  }, []);

  return (
    <h2 className="flex flex-col gap-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold mt-6 sm:mt-8 md:mt-10 mb-12 sm:mb-16 md:mb-20 px-4">
      <span>
        {firstText}
        {showCursor1 && <span className="animate-pulse">|</span>}
      </span>
      <span>
        {secondText}
        {showCursor2 && <span className="animate-pulse">|</span>}
      </span>
    </h2>
  );
}

export default function SolutionSection() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="mx-auto container px-4 sm:px-6">
        <TypewriterText />
        <ScaleIn delay={0.3}>
          <div className="bg-[var(--primary)] rounded-2xl sm:rounded-3xl px-6 sm:px-8 md:px-16 py-8 sm:py-10 md:py-12 lg:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-w-7xl mx-auto">
              {/* Left Content */}
              <div className="flex flex-col gap-3 text-center md:text-left">
                <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold !text-white">
                  Avec Andunu, c'est simple et fiable.
                </h4>
              </div>

              {/* Right Button */}
              <Link 
                href="/planifier"
                className="rounded-2xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-primary hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                Commencer
              </Link>
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}
