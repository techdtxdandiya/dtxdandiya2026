import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CountdownTimer from './components/CountdownTimer';
import Schedule from './components/Schedule';
import AboutUs from './components/AboutUs';
import OrderOfPhoenix from './components/OrderOfPhoenix';
import Sponsors from './components/Sponsors';
import Resources from './components/Resources';
import Footer from './components/Footer';
import MagicalCursor from './components/MagicalCursor';
import Login from './components/TeamPortal/Login';
import Dashboard from './components/TeamPortal/Dashboard';
import Locations from './components/Locations';
import NotFound from './components/NotFound';

function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div 
        className="min-h-screen flex flex-col items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/backgrounds/home_page.jpg')" }}
      >
        <div className="text-center flex flex-col items-center mt-[65vh]">
          <div className="mb-16">
            <CountdownTimer />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <a 
              href="https://ticketscandy.com/e/dtx-dandiya-2025-raasgarba-dance-competition-6505" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="
                relative px-6 sm:px-12 py-3 sm:py-4 text-lg sm:text-2xl text-white uppercase tracking-[0.2em]
                before:content-[''] before:absolute before:-inset-1
                before:border before:border-white/30 before:rounded-lg
                after:content-[''] after:absolute after:-inset-2
                after:border after:border-white/20 after:rounded-lg
                hover:before:border-white/50 hover:after:border-white/30
                before:transition-colors after:transition-colors
                glow-text hover:glow-text-intense
                magical-border transform hover:scale-105 transition-transform
                bg-black/10 backdrop-blur-sm
              "
            >
              Buy Tickets
            </a>

            <a 
              href="/team-portal/login"
              className="
                relative px-6 sm:px-12 py-3 sm:py-4 text-lg sm:text-2xl text-white uppercase tracking-[0.2em]
                before:content-[''] before:absolute before:-inset-1
                before:border before:border-white/30 before:rounded-lg
                after:content-[''] after:absolute after:-inset-2
                after:border after:border-white/20 after:rounded-lg
                hover:before:border-white/50 hover:after:border-white/30
                before:transition-colors after:transition-colors
                glow-text hover:glow-text-intense
                magical-border transform hover:scale-105 transition-transform
                bg-black/10 backdrop-blur-sm
              "
            >
              Team Portal
            </a>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <section className="py-20 bg-black">
        <h2 className="text-5xl text-center mb-16 font-['Harry_Potter'] text-white glow-text">
           Competition Schedule
        </h2>
        <Schedule />
      </section>

      {/* Locations Section */}
      <Locations />

      {/* About Us Section */}
      <AboutUs />

      {/* Order of Phoenix Section */}
      <OrderOfPhoenix />

      {/* Sponsors Section */}
      <Sponsors />

      {/* Resources Section */}
      <Resources />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <MagicalCursor />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team-portal/login" element={<Login />} />
        <Route path="/team-portal/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;