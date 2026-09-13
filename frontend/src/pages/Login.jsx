import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../services/authService';
import { ArrowUpRight, Sprout } from '../components/IconLibrary';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form);
      const destination = location.state?.from?.pathname || `/${user.role}`;
      navigate(destination, { replace: true });
    } catch (submitError) { setError(submitError.message); } finally { setLoading(false); }
  }

  return <main className="auth-page"><div className="auth-visual"><Link to="/" className="logo logo-light"><Sprout size={19} /> FarmNexus</Link><div><span className="eyebrow light"><span className="eyebrow-dot" /> The smarter way to farm</span><h2>Good tools make<br /><em>good seasons.</em></h2><p>Connect to the equipment and people that help your farm thrive.</p></div><span className="auth-quote">Access is the first step to growth.</span></div><section className="auth-panel"><Link to="/" className="mobile-logo logo"><Sprout size={19} /> FarmNexus</Link><div className="auth-heading"><span className="section-kicker">Welcome back</span><h1>Welcome Back</h1><p>Sign in to continue to your Farm-Nexus workspace.</p></div><form onSubmit={handleSubmit} className="auth-form"><label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'} <ArrowUpRight size={16} /></button></form><p className="auth-switch">Don't have an account? <Link to="/register">Create Account</Link></p></section></main>;
}
