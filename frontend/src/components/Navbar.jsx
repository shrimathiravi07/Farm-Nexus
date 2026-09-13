import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getUser, logout } from '../services/authService';
import { ArrowUpRight, LogOut, Sprout, User } from './IconLibrary';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={`navbar${menuOpen ? ' menu-open' : ''}`}>
      <Link to="/" className="logo"><span className="brand-mark"><Sprout size={19} /></span>FarmNexus</Link>
      <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      <div className="nav-links" onClick={() => setMenuOpen(false)}>
        {user ? (
          <>
            <span id="welcomeUser"><User size={15} /> {user.name}</span>
            <button type="button" className="btn btn-outline" onClick={handleLogout}><LogOut size={15} /> Logout</button>
          </>
        ) : (
          <>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary">Get started <ArrowUpRight size={15} /></Link>
          </>
        )}
      </div>
    </nav>
  );
}
