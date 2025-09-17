import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="items-stretch bg-[#0A0E09] flex w-full flex-col overflow-hidden justify-center px-4 sm:px-6 lg:px-8 xl:px-16 py-8 sm:py-10">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex w-full items-stretch flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex min-w-0 flex-col flex-1 shrink basis-[0%] lg:max-w-md">
            <div className="self-stretch flex w-full flex-col items-stretch">
              <div className="text-white text-sm font-bold leading-relaxed">
                Connect with us
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-3">
                <div className="self-stretch flex gap-2 my-auto">
                  <a href="#" aria-label="Social media link">
                    <div className="justify-center items-center bg-[#333] flex gap-2.5 w-7 h-7 sm:w-8 sm:h-8 px-1 rounded-[999px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/79a67a85abe95ba4bcdec56a436fad3acc58b147?placeholderIfAbsent=true"
                        className="aspect-[1] object-contain w-5 sm:w-6 self-stretch my-auto"
                        alt="Social icon 1"
                      />
                    </div>
                  </a>
                  <a href="#" aria-label="Social media link">
                    <div className="justify-center items-center bg-[#333] flex gap-2.5 w-7 h-7 sm:w-8 sm:h-8 px-1 rounded-[999px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/0d5d6522d7889983ed20cb089cfb34838f8c20dc?placeholderIfAbsent=true"
                        className="aspect-[1] object-contain w-5 sm:w-6 self-stretch my-auto"
                        alt="Social icon 2"
                      />
                    </div>
                  </a>
                  <a href="#" aria-label="Social media link">
                    <div className="justify-center items-center bg-[#333] flex gap-2.5 w-7 h-7 sm:w-8 sm:h-8 px-1 rounded-[999px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/186d681ec9b60cac7599f7f105298cfbd8a6a30a?placeholderIfAbsent=true"
                        className="aspect-[1] object-contain w-5 sm:w-6 self-stretch my-auto"
                        alt="Social icon 3"
                      />
                    </div>
                  </a>
                  <a href="#" aria-label="Social media link">
                    <div className="justify-center items-center bg-[#333] flex gap-2.5 w-7 h-7 sm:w-8 sm:h-8 px-1 rounded-[999px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/5ce9c8228bb45c42bcdccdf73f9f10dd43e604fc?placeholderIfAbsent=true"
                        className="aspect-[1] object-contain w-5 sm:w-6 self-stretch my-auto"
                        alt="Social icon 4"
                      />
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
              <a href="#" aria-label="App Store">
                <div className="bg-[#0A0E09] flex w-full sm:w-[120px] shrink-0 h-10 rounded-[5px]" />
              </a>
              <a href="#" aria-label="Google Play">
                <div className="bg-[#0A0E09] flex w-full sm:w-[120px] shrink-0 h-10 rounded-[5px]" />
              </a>
            </div>
            <div className="justify-center items-center bg-[#333] flex min-h-8 w-full sm:w-[200px] max-w-full gap-2 text-sm sm:text-[15px] text-white font-bold whitespace-nowrap leading-none mt-6 pl-3 pr-2 py-1.5 rounded-[28px]">
              <div 
                className="self-stretch my-auto text-black font-black uppercase text-xs sm:text-sm"
                style={{ fontFamily: 'Luckiest Guy, cursive' }}
              >
                ECO QUEST
              </div>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden items-stretch leading-relaxed w-full sm:w-60">
            <div className="text-white text-sm font-bold">Company</div>
            <nav className="text-xs text-[#bababa] font-normal mt-3">
              <a href="#" className="block hover:text-white">
                About us
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Careers
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Advertise with us
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Terms of Use
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Copyright Policy
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Cookie Policy
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Cookie Preferences
              </a>
            </nav>
          </div>
          <div className="flex flex-col overflow-hidden items-stretch leading-relaxed w-full sm:w-60">
            <div className="text-white text-sm font-bold">Community</div>
            <nav className="text-xs text-[#bababa] font-normal mt-3">
              <a href="#" className="block hover:text-white">
                Eco Quest Community
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Eco Quest for Schools & Teachers
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Eco Quest for Parents
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Eco Quest Scholarships
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Honor Code
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Community Guidelines
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Insights: The Eco Quest Blog
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Become a Volunteer
              </a>
            </nav>
          </div>
          <div className="flex flex-col overflow-hidden items-stretch leading-relaxed w-full sm:w-60">
            <div className="text-white text-sm font-bold">Help</div>
            <nav className="text-xs text-[#bababa] font-normal mt-3">
              <a href="#" className="block hover:text-white">
                Signup
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Help Center
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Safety Center
              </a>
              <a href="#" className="block mt-2 hover:text-white">
                Responsible Disclosure Agreement
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
