import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/authService';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const user = getUser();

  if (!isAuthenticated() || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar role={user.role} />
        <main className="dashboard-main"><Outlet /></main>
      </div>
    </>
  );
}
