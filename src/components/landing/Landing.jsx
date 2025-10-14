import './Landing.scss';
import Logo from "../../assets/logo.png";

const Landing = ({ onShowLogin, onShowRegister }) => {
  return (
    <div className="landing-page">
      <div className="container">
        <header className="header">
          <div className="logo">
            <img className="logo-img" src={Logo} alt="Freestyle Logo" />
            {/* <svg viewBox="0 0 100 100" className="logo-svg">
              <path d="M50 10 L90 90 L10 90 Z" fill="#D32F2F"/>
              <text x="50" y="70" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">FV</text>
            </svg> */}
          </div>
          <p className="subtitle">Volunteer Portal</p>
        </header>

        <main className="main-content">
          <div className="welcome-card">
            <h2>Welcome Volunteers!</h2>
            <p className="welcome-text">
              Thank you for supporting Freestyle Vancouver! Our club thrives because of dedicated volunteers like you who help on and off the mountain.
            </p>
            <p className="welcome-text">
              Whether you're helping with training days, events, or administrative tasks, your contribution makes a real difference in our athletes' experience.
            </p>
          </div>

          <div className="registration-notice">
            <h3>Important Notice</h3>
            <p>
              All volunteers must be registered for the 2025-26 season before signing up for volunteer shifts.
            </p>
            <a 
              href="https://snowreg.com/#!/series/freestyle-vancouver-202526-1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="register-link"
            >
              Register for 2025-26 Season →
            </a>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={onShowLogin}>
              Sign In
            </button>
            <button className="btn btn-secondary" onClick={onShowRegister}>
              Sign Up
            </button>
          </div>

          <div className="info-text">
            <p>New to volunteering? Sign up to create your account.</p>
            <p>Already have an account? Sign in to view and manage your volunteer shifts.</p>
          </div>
        </main>

        <footer className="footer">
          <p>Questions? Contact us at <a href="mailto:info@freestylevancouver.ski">info@freestylevancouver.ski</a></p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;