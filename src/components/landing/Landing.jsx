import Logo from "../../assets/logo.png";

const Landing = ({ onShowLogin, onShowRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans text-gray-900 overflow-y-auto">
      <div className="max-w-[600px] min-h-screen mx-auto px-6 sm:px-4 flex flex-col justify-between">
        <header className="text-center mb-6 flex-shrink-0">
          <div className="mx-auto mb-4 w-40 h-[88px] sm:w-[120px] sm:h-[66px]">
            <img className="w-full h-full drop-shadow-md" src={Logo} alt="Freestyle Logo" />
          </div>
          <p className="text-2xl sm:text-lg text-gray-600 m-0 font-normal">Volunteer Portal</p>
        </header>

        <main className="flex-1 flex flex-col justify-center min-h-0">
          <div className="bg-white rounded-xl p-6 sm:p-4 mb-6 sm:mb-4 shadow-lg border-t-4 border-red-600">
            <h2 className="text-xl sm:text-lg text-gray-900 mb-4 font-semibold">Welcome Volunteers!</h2>
            <p className="text-[15px] sm:text-sm leading-relaxed text-gray-600 mb-4">
              Thank you for supporting Freestyle Vancouver! Our club thrives because of dedicated volunteers like you who help on and off the mountain.
            </p>
            <p className="text-[15px] sm:text-sm leading-relaxed text-gray-600">
              Whether you're helping with training days, events, or administrative tasks, your contribution makes a real difference in our athletes' experience.
            </p>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6 sm:mb-4">
            <h3 className="text-base sm:text-[15px] text-gray-900 mb-2 font-semibold">Important Notice</h3>
            <p className="text-sm sm:text-[13px] leading-snug text-gray-900 mb-2">
              All volunteers must be registered with SNOWREG for the 2025-26 season before signing up for volunteer opportunities.
            </p>
            <a 
              href="https://snowreg.com/#!/series/freestyle-vancouver-202526-1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-orange-800 font-semibold no-underline text-sm sm:text-[13px] transition-colors hover:text-orange-900 hover:underline"
            >
              Register for 2025-26 Season →
            </a>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <button 
              className="w-full px-6 py-4 sm:py-3 text-base sm:text-[15px] font-semibold border-none rounded-lg cursor-pointer transition-all bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-800 hover:shadow-xl hover:shadow-red-600/40 active:translate-y-px active:shadow-md focus:outline-none focus:ring-4 focus:ring-red-600/30" 
              onClick={onShowLogin}
            >
              Sign In
            </button>
            <button 
              className="w-full px-6 py-4 sm:py-3 text-base sm:text-[15px] font-semibold border-2 border-red-600 rounded-lg cursor-pointer transition-all bg-white text-red-600 shadow-md hover:bg-red-50 hover:border-red-800 hover:text-red-800 active:translate-y-px active:shadow-sm focus:outline-none focus:ring-4 focus:ring-red-600/30" 
              onClick={onShowRegister}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center">
            <p className="text-[13px] sm:text-xs text-gray-600 my-1 leading-snug">New to volunteering? Sign up to create your account.</p>
            <p className="text-[13px] sm:text-xs text-gray-600 my-1 leading-snug">Already have an account? Sign in to view and manage your volunteer shifts.</p>
          </div>
        </main>

        <footer className="text-center mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <p className="text-[13px] sm:text-xs text-gray-600 m-0">
            Questions? Contact us at{" "}
            <a href="mailto:info@freestylevancouver.ski" className="text-red-600 no-underline font-medium transition-colors hover:text-red-800 hover:underline">
              info@freestylevancouver.ski
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;