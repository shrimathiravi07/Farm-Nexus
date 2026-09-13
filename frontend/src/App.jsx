import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerEquipment from './pages/farmer/Equipment';
import EquipmentDetails from './pages/farmer/EquipmentDetails';
import Recommendation from './pages/farmer/Recommendation';
import NearbyEquipment from './pages/farmer/NearbyEquipment';
import Booking from './pages/farmer/Booking';
import Appointments from './pages/farmer/Appointments';
import AIAssistant from './pages/farmer/AIAssistant';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderEquipment from './pages/provider/Equipment';
import AddEquipment from './pages/provider/AddEquipment';
import ProviderSlots from './pages/provider/Slots';
import ProviderBookings from './pages/provider/Bookings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEquipment from './pages/admin/Equipment';
import AdminAppointments from './pages/admin/Appointments';
import Analytics from './pages/admin/Analytics';

const roleRoutes = (role, children) => <Route element={<ProtectedRoute roles={[role]} />}>{children}</Route>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {roleRoutes('farmer', <>
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/farmer/equipment" element={<FarmerEquipment />} />
          <Route path="/farmer/equipment/:equipmentId" element={<EquipmentDetails />} />
          <Route path="/farmer/recommendations" element={<Recommendation />} />
          <Route path="/farmer/nearby" element={<NearbyEquipment />} />
          <Route path="/farmer/booking/:equipmentId" element={<Booking />} />
          <Route path="/farmer/appointments" element={<Appointments />} />
          <Route path="/farmer/assistant" element={<AIAssistant />} />
        </>)}
        {roleRoutes('provider', <>
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/equipment" element={<ProviderEquipment />} />
          <Route path="/provider/equipment/new" element={<AddEquipment />} />
          <Route path="/provider/slots" element={<ProviderSlots />} />
          <Route path="/provider/bookings" element={<ProviderBookings />} />
        </>)}
        {roleRoutes('admin', <>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/equipment" element={<AdminEquipment />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </>)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
