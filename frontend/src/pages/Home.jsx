import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowDown, ArrowUpRight, CalendarDays, ShieldCheck, Sprout, Tractor } from '../components/IconLibrary';

export default function Home() {
  return (
    <div className="public-page">
      <Navbar />
      <main>
        <section className="hero home-hero" aria-label="FarmNexus smart agriculture">
          <div className="hero-content reveal-up">
            <span className="eyebrow"><span className="eyebrow-dot" /> Smart agriculture, connected</span>
            <h1>Smart equipment.<br /><em>Smarter farming.</em></h1>
            <p>Find, book, and manage the agricultural equipment and resources that keep your farm moving forward.</p>
            <div className="hero-btns">
              <Link to="/register" className="btn btn-primary btn-large">Get started <ArrowUpRight size={16} /></Link>
              <a href="#how-it-works" className="btn btn-ghost btn-large">See how it works <ArrowDown size={16} /></a>
            </div>
            <div className="hero-proof"><span>●</span> Built for farmers and providers <b>·</b> Book with confidence</div>
          </div>
        </section>

        <section className="section features-section" id="features">
          <div className="section-heading reveal-up"><span className="section-kicker">Why Farm-Nexus?</span><h2>Everything your farm needs,<br /><span>in one place.</span></h2><p>Less searching. More growing. A simpler way to access the tools behind a productive season.</p></div>
          <div className="feature-grid">
            <article className="feature-card reveal-up"><div className="feature-icon"><Tractor /></div><h3>Wide Selection</h3><p>From tractors to heavy harvesters, find exactly what your farm needs for any season.</p><Link to="/register" className="text-link">Explore equipment <ArrowUpRight size={14} /></Link></article>
            <article className="feature-card reveal-up"><div className="feature-icon"><CalendarDays /></div><h3>Instant Booking</h3><p>Real-time availability tracking. Book slots in seconds and manage your schedule effortlessly.</p><Link to="/register" className="text-link">Book a resource <ArrowUpRight size={14} /></Link></article>
            <article className="feature-card reveal-up"><div className="feature-icon"><ShieldCheck /></div><h3>Verified Providers</h3><p>Work with trusted local providers. Every piece of equipment is verified for quality.</p><Link to="/register" className="text-link">Join the network <ArrowUpRight size={14} /></Link></article>
          </div>
        </section>

        <section className="section how-section" id="how-it-works">
          <div className="section-heading centered reveal-up"><span className="section-kicker">Simple by design</span><h2>How it works</h2><p>From sign-up to booked equipment in three clear steps.</p></div>
          <div className="steps-grid">
            <article className="step-card reveal-up"><div className="step-number">01</div><div><h3>Register</h3><p>Create your account as a Farmer or Provider.</p></div></article>
            <div className="step-connector" />
            <article className="step-card reveal-up"><div className="step-number">02</div><div><h3>Browse</h3><p>Search for available equipment near you.</p></div></article>
            <div className="step-connector" />
            <article className="step-card reveal-up"><div className="step-number">03</div><div><h3>Book</h3><p>Pick a slot and confirm your booking instantly.</p></div></article>
          </div>
        </section>

        <section className="cta-section reveal-up"><div><span className="section-kicker">Your next season starts here</span><h2>Ready to make farming easier?</h2><p>Find the equipment you need and get started with Farm-Nexus.</p></div><Link to="/register" className="btn btn-light btn-large">Get started <ArrowUpRight size={16} /></Link></section>
      </main>
      <footer className="site-footer"><div className="footer-brand"><Sprout size={18} /> <strong>FarmNexus</strong></div><p>© 2024 FarmNexus. Empowering the next generation of farmers.</p></footer>
    </div>
  );
}
