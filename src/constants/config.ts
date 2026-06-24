import {
  Service,
  CustomerSource,
  Durability,
  Booking,
  BookingStatus,
} from '@/types';
// import { format } from 'date-fns';

// export const TODAY: string = format(new Date(), 'yyyy-MM-dd');
export const TODAY: Date = new Date();
export const SERVICES: Service[] = [
  {
    id: 'massage-body-nu',
    nameVi: 'Massage body nữ',
    subName: 'Body Nữ',
    durationMin: 60,
    priceVnd: 150,
  },
  {
    id: 'massage-body-nam',
    nameVi: 'Massage body nam',
    subName: 'Body Nam',
    durationMin: 50,
    priceVnd: 150,
  },
  {
    id: 'tri-lieu-co-vai-gay',
    nameVi: 'Trị liệu cổ vai gáy',
    subName: 'Cổ vai gáy',
    durationMin: 50,
    priceVnd: 180,
  },
  {
    id: 'tri-lieu-dau-lung',
    nameVi: 'Trị liệu đau lưng',
    subName: 'Đau lưng',
    durationMin: 50,
    priceVnd: 180,
  },
  {
    id: 'massage-bung',
    nameVi: 'Massage bụng',
    subName: 'Bụng',
    durationMin: 30,
    priceVnd: 150,
  },
  {
    id: 'goi-dau-35',
    nameVi: 'Gội đầu dưỡng sinh 35p',
    subName: 'Gội 35p',
    durationMin: 35,
    priceVnd: 50,
  },
  {
    id: 'goi-dau-50',
    nameVi: 'Gội đầu dưỡng sinh 50p',
    subName: 'Gội 50p',
    durationMin: 50,
    priceVnd: 70,
  },
  {
    id: 'goi-dau-60',
    nameVi: 'Gội đầu dưỡng sinh 60p',
    subName: 'Gội 60p',
    durationMin: 60,
    priceVnd: 90,
  },
  {
    id: 'goi-dau-85',
    nameVi: 'Gội đầu dưỡng sinh 85p',
    subName: 'Gội 85p',
    durationMin: 85,
    priceVnd: 150,
  },
  {
    id: 'goi-dau-100',
    nameVi: 'Gội đầu dưỡng sinh 100p',
    subName: 'Gội 100p',
    durationMin: 100,
    priceVnd: 200,
  },
  {
    id: 'dich-vu-them',
    nameVi: 'Dịch vụ thêm',
    subName: 'Thêm',
    durationMin: 15,
    priceVnd: 0,
  },
];

export const BEDS = ['1', '2', '3', '4', '5'] as const;

export function statusCfg(s: BookingStatus) {
  return {
    open: { label: 'Mở', color: '#6B7280', bg: 'rgba(107,114,128,.15)' },
    upcoming: {
      label: 'Sắp tới',
      color: '#FACC15',
      bg: 'rgba(250,204,21,.15)',
    },
    in_progress: {
      label: 'Đang làm',
      color: '#7C6AF7',
      bg: 'rgba(124,106,247,.18)',
    },
    done: { label: 'Xong', color: '#4ADE80', bg: 'rgba(74,222,128,.15)' },
    cancelled: { label: 'Huỷ', color: '#DE4728', bg: 'rgba(80,321,62,.15)' },
  }[s];
}

export function sourceCfg(s: CustomerSource) {
  return {
    dot_xuat: { label: 'Đột xuất', color: '#8B8FA8' },
    tiktok: { label: 'Tiktok', color: '#F472B6' },
    ban_be: { label: 'Bạn bè', color: '#4ADE80' },
  }[s];
}

export function durCfg(d: Durability) {
  return {
    tot: { label: 'Tốt', bg: 'rgba(74,222,128,.15)', color: '#4ADE80' },
    trung_binh: {
      label: 'Trung bình',
      bg: 'rgba(250,204,21,.15)',
      color: '#FACC15',
    },
    can_thay: {
      label: 'Cần thay',
      bg: 'rgba(248,113,113,.15)',
      color: '#F87171',
    },
  }[d];
}

export const EMPTY_DRAFT: Booking = {
  id: '',
  customerName: '',
  phone: '',
  serviceId: '',
  bedNumber: '1',
  date: TODAY,
  startTime: '09:00',
  staffId: '',
  note: '',
  status: BookingStatus.OPEN,
};

export const TABLE_NAMES = {
  BOOKINGS: 'bookings',
  CUSTOMERS: 'customers',
  STAFF: 'staff',
  MATERIALS: 'materials',
};
