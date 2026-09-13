import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../services/authService';
import { ArrowUpRight, Sprout } from '../components/IconLibrary';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'farmer', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { const user = await register(form); navigate(`/${user.role}`, { replace: true }); }
    catch (submitError) { setError(submitError.message); } finally { setLoading(false); }
  }

  return <main className="auth-page"><div className="auth-visual register-visual"><Link to="/" className="logo logo-light"><Sprout size={19} /> FarmNexus</Link><div><span className="eyebrow light"><span className="eyebrow-dot" /> Grow together</span><h2>Build a better<br /><em>farm future.</em></h2><p>Join a connected community making agricultural resources work harder.</p></div><span className="auth-quote">Farmers and providers, growing together.</span></div><section className="auth-panel"><Link to="/" className="mobile-logo logo"><Sprout size={19} /> FarmNexus</Link><div className="auth-heading"><span className="section-kicker">Join the network</span><h1>Create Your Account</h1><p>Choose how you want to grow with Farm-Nexus.</p></div><form onSubmit={handleSubmit} className="auth-form register-form"><div className="form-row"><label>Full name<input type="text" value={form.name} onChange={update('name')} placeholder="Your full name" required /></label><label>Phone number<input type="tel" value={form.phone} onChange={update('phone')} placeholder="Optional" /></label></div><label>Email address<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required /></label><label>I am a<select value={form.role} onChange={update('role')}><option value="farmer">Farmer — I want to rent equipment</option><option value="provider">Provider — I have equipment to rent</option></select></label><label>Password<input type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" minLength="6" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'} <ArrowUpRight size={16} /></button></form><p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p></section></main>;
}
