import { NavItem } from '../types/ui';
import { Calendar, Users, UserCircle, Package } from 'lucide-react';

export const APP_NAV: NavItem[] = [
  {
    href: '/bookings',
    icon: <Calendar className="size-4" />,
    label: 'Lịch đặt',
  },
  { href: '/staff', icon: <Users className="size-4" />, label: 'Nhân viên' },
  {
    href: '/customers',
    icon: <UserCircle className="size-4" />,
    label: 'Khách hàng',
  },
  {
    href: '/materials',
    icon: <Package className="size-4" />,
    label: 'Vật liệu',
  },
];
