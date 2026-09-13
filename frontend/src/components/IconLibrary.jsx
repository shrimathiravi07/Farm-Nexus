import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Cog,
  Droplets,
  FlaskConical,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Sprout,
  Settings,
  Tractor,
  Trash2,
  User,
  Wind,
  XCircle,
} from 'lucide-react';

export const categoryIcons = {
  Tractor,
  Irrigation: Droplets,
  Drone: Wind,
  Harvesting: Sprout,
  Lab: FlaskConical,
  Other: Package,
};

export function CategoryIcon({ category, size = 28, strokeWidth = 1.8 }) {
  const Icon = categoryIcons[category] || Cog;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function StatusIcon({ status, size = 15 }) {
  const Icon = status === 'confirmed' ? CheckCircle2 : status === 'cancelled' ? XCircle : status === 'completed' ? Check : Clock3;
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
}

export {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Cog,
  Droplets,
  FlaskConical,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Sprout,
  Settings,
  Tractor,
  Trash2,
  User,
  Wind,
  XCircle,
};
