import { BookingStatus } from '../types/booking';
import { CustomerSource } from '../types/customer';
import { Durability } from '../types/material';

export const TIMELINE_START_MIN = 9 * 60;
export const TIMELINE_TOTAL_MIN = 12 * 60;

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
    cancelled: { label: 'Huỷ', color: '#ED4A28', bg: 'rgba(92,312,128,.15)' },
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
