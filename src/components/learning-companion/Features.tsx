import React, { useEffect } from "react";

export const Features: React.FC = () => {
  useEffect(() => {
    // Stacking cards effect
    const initStackCards = () => {
      const stackCards = document.querySelectorAll('.js-stack-cards');
      const intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) {
        stackCards.forEach((element) => {
          const items = element.querySelectorAll('.js-stack-cards__item');
          let scrollingFn: any = false;
          let scrolling = false;
          let marginY = 16; // 1rem
          let cardTop = 32; // 2rem  
          let cardHeight = 0;
          let windowHeight = window.innerHeight;
          let elementHeight = (element as HTMLElement).offsetHeight;

          const setStackCards = () => {
            if (items.length > 0) {
              const firstItem = items[0] as HTMLElement;
              cardHeight = firstItem.offsetHeight;
              (element as HTMLElement).style.paddingBottom = (marginY * (items.length - 1)) + 'px';
              
              items.forEach((item, i) => {
                (item as HTMLElement).style.transform = `translateY(${marginY * i}px)`;
              });
            }
          };

          const animateStackCards = () => {
            const rect = element.getBoundingClientRect();
            const top = rect.top;

            if (cardTop - top + windowHeight - elementHeight - cardHeight + marginY + marginY * items.length > 0) {
              scrolling = false;
              return;
            }

            items.forEach((item, i) => {
              const scrollingOffset = cardTop - top - i * (cardHeight + marginY);
              if (scrollingOffset > 0) {
                const scaling = i === items.length - 1 ? 1 : (cardHeight - scrollingOffset * 0.05) / cardHeight;
                (item as HTMLElement).style.transform = `translateY(${marginY * i}px) scale(${scaling})`;
              } else {
                (item as HTMLElement).style.transform = `translateY(${marginY * i}px)`;
              }
            });

            scrolling = false;
          };

          const stackCardsScrolling = () => {
            if (scrolling) return;
            scrolling = true;
            window.requestAnimationFrame(animateStackCards);
          };

          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              if (!scrollingFn) {
                scrollingFn = stackCardsScrolling;
                window.addEventListener('scroll', scrollingFn);
              }
            } else {
              if (scrollingFn) {
                window.removeEventListener('scroll', scrollingFn);
                scrollingFn = false;
              }
            }
          }, { threshold: [0, 1] });

          observer.observe(element);
          setStackCards();

          const handleResize = () => {
            windowHeight = window.innerHeight;
            elementHeight = (element as HTMLElement).offsetHeight;
            setStackCards();
          };

          window.addEventListener('resize', handleResize);
        });
      }
    };

    const timer = setTimeout(initStackCards, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="self-center flex w-full flex-col items-center pt-10 pb-20 max-md:max-w-full">
      <div className="w-[720px] max-w-full text-[45px] text-[#0a0e09] font-black text-center leading-[39px] py-3 max-md:max-w-full max-md:text-[40px] max-md:leading-[38px]">
        SAVING THE PLANET SHOULDN'T FEEL OVERWHELMING.
      </div>
      
      <div className="w-full max-w-4xl mt-8">
        <ul className="stack-cards js-stack-cards">
          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <div className="flex items-center justify-between p-8 h-full">
              <div className="flex-1">
                <h3 className="text-[41px] font-black leading-none tracking-[-0.41px] text-[#0a0e09] mb-6">
                  Interactive Lessons
                </h3>
                <p className="text-base font-light leading-[22px] tracking-[0.47px] text-[#0a0e09] mb-16">
                  Learn environmental science through engaging interactive content and multimedia experiences.
                </p>
                <button className="bg-[#0a0e09] text-xs text-white font-bold px-4 py-2 rounded-full">
                  Start learning
                </button>
              </div>
              <div className="w-[232px] h-[200px] bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center">
                <div className="text-4xl">🌱</div>
              </div>
            </div>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <div className="flex items-center justify-between p-8 h-full">
              <div className="flex-1">
                <h3 className="text-[41px] font-black leading-none tracking-[-0.41px] text-[#0a0e09] mb-6">
                  Eco Challenges
                </h3>
                <p className="text-base font-light leading-[22px] tracking-[0.47px] text-[#0a0e09] mb-16">
                  Complete real-world environmental tasks like tree planting, waste segregation, and green actions.
                </p>
                <button className="bg-[#0a0e09] text-xs text-white font-bold px-4 py-2 rounded-full">
                  Take challenge
                </button>
              </div>
              <div className="w-[232px] h-[200px] bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl flex items-center justify-center">
                <div className="text-4xl">🌍</div>
              </div>
            </div>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <div className="flex items-center justify-between p-8 h-full">
              <div className="flex-1">
                <h3 className="text-[41px] font-black leading-none tracking-[-0.41px] text-[#0a0e09] mb-6">
                  Green Quizzes
                </h3>
                <p className="text-base font-light leading-[22px] tracking-[0.47px] text-[#0a0e09] mb-16">
                  Test your environmental knowledge with gamified quizzes and earn eco-points for each correct answer.
                </p>
                <button className="bg-[#0a0e09] text-xs text-white font-bold px-4 py-2 rounded-full">
                  Take quiz
                </button>
              </div>
              <div className="w-[232px] h-[200px] bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-xl flex items-center justify-center">
                <div className="text-4xl">🧠</div>
              </div>
            </div>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <div className="flex items-center justify-between p-8 h-full">
              <div className="flex-1">
                <h3 className="text-[41px] font-black leading-none tracking-[-0.41px] text-[#0a0e09] mb-6">
                  Eco Rewards
                </h3>
                <p className="text-base font-light leading-[22px] tracking-[0.47px] text-[#0a0e09] mb-16">
                  Earn digital badges, recognition, and compete with schools through sustainable practice tracking.
                </p>
                <button className="bg-[#0a0e09] text-xs text-white font-bold px-4 py-2 rounded-full">
                  View rewards
                </button>
              </div>
              <div className="w-[232px] h-[200px] bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl flex items-center justify-center">
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Features;
