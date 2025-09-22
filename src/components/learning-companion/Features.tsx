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
    <div className="self-center flex w-full flex-col items-center pt-4 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a0e09] dark:text-white font-black text-center leading-tight py-3">
        SAVING THE PLANET SHOULDN'T FEEL OVERWHELMING.
      </div>
      
      <div className="w-full max-w-6xl mt-6 sm:mt-8">
        <ul className="stack-cards js-stack-cards">
          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row w-full sm:max-w-none overflow-hidden hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div className="flex flex-col justify-between p-4 sm:p-6 leading-normal w-full sm:w-1/2">
                <h5 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Interactive Lessons</h5>
                <p className="mb-3 font-normal text-sm sm:text-base text-gray-700 dark:text-gray-400">Learn environmental science through engaging interactive content and multimedia experiences.</p>
              </div>
              <img className="object-cover w-full rounded-b-lg h-48 sm:h-full sm:w-1/2 sm:max-w-[360px] lg:max-w-[420px] sm:rounded-none sm:rounded-e-lg" src="/lesson.png" alt="Interactive Lessons" />
            </a>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row w-full sm:max-w-none overflow-hidden hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div className="flex flex-col justify-between p-4 sm:p-6 leading-normal w-full sm:w-1/2">
                <h5 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Eco Challenges</h5>
                <p className="mb-3 font-normal text-sm sm:text-base text-gray-700 dark:text-gray-400">Complete real-world environmental tasks like tree planting, waste segregation, and green actions.</p>
              </div>
              <img className="object-cover w-full rounded-b-lg h-48 sm:h-full sm:w-1/2 sm:max-w-[360px] lg:max-w-[420px] sm:rounded-none sm:rounded-e-lg" src="/task1.png" alt="Eco Challenges" />
            </a>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row w-full sm:max-w-none overflow-hidden hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div className="flex flex-col justify-between p-4 sm:p-6 leading-normal w-full sm:w-1/2">
                <h5 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Green Quizzes</h5>
                <p className="mb-3 font-normal text-sm sm:text-base text-gray-700 dark:text-gray-400">Test your environmental knowledge with gamified quizzes and earn eco-points for each correct answer.</p>
              </div>
              <img className="object-cover w-full rounded-b-lg h-48 sm:h-full sm:w-1/2 sm:max-w-[360px] lg:max-w-[420px] sm:rounded-none sm:rounded-e-lg" src="/task2.png" alt="Green Quizzes" />
            </a>
          </li>

          <li className="stack-cards__item bg-[#f2f2f2] rounded-2xl shadow-lg js-stack-cards__item">
            <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row w-full sm:max-w-none overflow-hidden hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
              <div className="flex flex-col justify-between p-4 sm:p-6 leading-normal w-full sm:w-1/2">
                <h5 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Eco Rewards</h5>
                <p className="mb-3 font-normal text-sm sm:text-base text-gray-700 dark:text-gray-400">Earn digital badges, recognition, and compete with schools through sustainable practice tracking.</p>
              </div>
              <img className="object-cover w-full rounded-b-lg h-48 sm:h-full sm:w-1/2 sm:max-w-[360px] lg:max-w-[420px] sm:rounded-none sm:rounded-e-lg" src="/task3.png" alt="Eco Rewards" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Features;
