'use client';

import { useState, useTransition, use } from 'react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Trash2, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Field } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { EMPTY_DRAFT, SERVICES, statusCfg, BEDS } from '@/constants/config';
import { TIMELINE_START_MIN, TIMELINE_TOTAL_MIN } from '@/constants/time';
import { checkConflict, TIME_SLOTS, timeToMin, HOUR_MARKS } from '@/utils/time';
import { formatPrice } from '@/utils/price';
import { Booking, BookingStatus, Staff } from '@/types';
import { cn } from '@/utils/common';
import { TODAY } from '@/constants/config';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { upsertBooking, softDeleteBookingById } from '@/lib/data/bookings';
import { findTodayBookings } from '@/lib/data/bookings';

// export function DatePickerField({
//   value,
//   onChange,
//   label,
// }: {
//   value: Date | undefined;
//   onChange: (d: Date) => void;
//   label?: string;
// }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="flex flex-col gap-1.5">
//       {label && (
//         <label className="text-sm font-medium text-foreground">{label}</label>
//       )}
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <button className="flex items-center gap-2 w-full rounded-md border border-input bg-input-background px-3 h-9 text-sm text-foreground hover:bg-secondary/60 transition-colors text-left">
//             <Calendar className="size-4 text-muted-foreground shrink-0" />
//             {value ? (
//               format(value, 'dd/MM/yyyy', { locale: vi })
//             ) : (
//               <span className="text-muted-foreground">Chọn ngày</span>
//             )}
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <CalendarPicker
//             mode="single"
//             selected={value}
//             onSelect={(d) => {
//               if (d) {
//                 onChange(d);
//                 setOpen(false);
//               }
//             }}
//             locale={vi}
//             initialFocus
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }

// export function BookingBlock({
//   booking,
//   onClick,
//   readOnly,
// }: {
//   booking: Booking;
//   onClick?: () => void;
//   readOnly: boolean;
// }) {
//   const svc = SERVICES.find((s) => s.id === booking.serviceId);
//   if (!svc) return null;
//   const left =
//     ((timeToMin(booking.startTime) - TIMELINE_START_MIN) / TIMELINE_TOTAL_MIN) *
//     100;
//   const width = (svc.durationMin / TIMELINE_TOTAL_MIN) * 100;
//   const cfg = statusCfg(booking.status);
//   return (
//     <div
//       className={cn(
//         'absolute top-1 bottom-1 rounded-lg border overflow-hidden min-w-[56px] transition-all',
//         !readOnly && 'cursor-pointer hover:brightness-110'
//       )}
//       style={{
//         left: `${left}%`,
//         width: `${width}%`,
//         backgroundColor: cfg.bg,
//         borderColor: cfg.color,
//       }}
//       onClick={readOnly ? undefined : onClick}
//     >
//       <div className="px-2 pt-1 h-full flex flex-col justify-center gap-0.5">
//         <p className="text-xs font-semibold text-foreground truncate leading-none">
//           {booking.customerName}
//         </p>
//         <p
//           className="text-[10px] truncate font-medium"
//           style={{ color: cfg.color }}
//         >
//           {svc.subName}
//         </p>
//       </div>
//       <div
//         className="absolute top-1 right-1.5 size-1.5 rounded-full"
//         style={{ backgroundColor: cfg.color }}
//       />
//     </div>
//   );
// }

// export function BookingTimeline({
//   bookings,
//   selectedDate,
//   onBlockClick,
//   readOnly = false,
// }: {
//   bookings: Booking[];
//   selectedDate: Date;
//   onBlockClick?: (b: Booking) => void;
//   readOnly?: boolean;
// }) {
//   const dayBookings = bookings.filter((b) => isSameDay(b.date, selectedDate));
//   const BEDS = ['1', '2', '3', '4'] as const;
//   return (
//     <div className="overflow-x-auto">
//       <div style={{ minWidth: 860 }}>
//         {/* Time header */}
//         <div className="flex ml-[88px] mb-2">
//           {HOUR_MARKS.map((h) => (
//             <div
//               key={h}
//               className="flex-1 text-[11px] font-mono text-muted-foreground text-center select-none"
//             >
//               {h}
//             </div>
//           ))}
//         </div>
//         {/* Bed rows */}
//         <div className="space-y-2">
//           {BEDS.map((bed) => (
//             <div key={bed} className="flex items-center gap-2">
//               <div className="w-[80px] shrink-0 flex justify-center">
//                 <Badge
//                   variant="outline"
//                   className="text-[11px] font-medium px-2 py-1"
//                 >
//                   Giường {bed}
//                 </Badge>
//               </div>
//               <div className="flex-1 relative h-[72px] rounded-lg border border-border bg-secondary/40">
//                 {HOUR_MARKS.map((h, i) => (
//                   <div
//                     key={h}
//                     className="absolute top-0 bottom-0 border-l border-border/40"
//                     style={{ left: `${(i / (HOUR_MARKS.length - 1)) * 100}%` }}
//                   />
//                 ))}
//                 {dayBookings
//                   .filter((b) => b.bedNumber === bed)
//                   .map((b) => (
//                     <BookingBlock
//                       key={b.id}
//                       booking={b}
//                       onClick={() => onBlockClick?.(b)}
//                       readOnly={readOnly}
//                     />
//                   ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export function BookingDrawer({
//   open,
//   onClose,
//   booking,
// }: {
//   open: boolean;
//   onClose: () => void;
//   booking: Booking | null;
// }) {
//   //   const form: Booking = { ...EMPTY_DRAFT };
//   //   const errs: Partial<Record<keyof Booking, string>> = {};
//   const [form, setForm] = useState<Booking>(EMPTY_DRAFT);
//   const [errs, setErrs] = useState<Partial<Record<keyof Booking, string>>>({});
//   const [conflict, setConflict] = useState(false);
//   const [delOpen, setDelOpen] = useState(false);
//   const [staff] = useState<Staff[]>(INIT_STAFF);
//   const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);

//   /*
//         const [form, setForm] = useState<Booking>(EMPTY_DRAFT)
//         const [errs, setErrs] = useState<Partial<Record<keyof Booking, string>>>({})
//         const [conflict, setConflict] = useState(false)
//         const [delOpen, setDelOpen] = useState(false)

//         React.useEffect(() => {
//             if (open) {
//             setForm(booking
//                 ? { id: booking.id, customerName: booking.customerName, phone: booking.phone, serviceId: booking.serviceId, bedNumber: booking.bedNumber, date: booking.date, startTime: booking.startTime, staffId: booking.staffId, note: booking.note ?? "", status: booking.status }
//                 : EMPTY_DRAFT
//             )
//             setErrs({}); setConflict(false)
//             }
//         }, [open, booking])
//   */

//   //   if (open) {
//   //     if (booking) {
//   //       Object.assign(form, booking);
//   //       //   setForm(bookingForm);
//   //     }
//   //     setErrs({});
//   //     setConflict(false);
//   //   }

//   const svc = SERVICES.find((s) => s.id === form.serviceId);
//   const member = staff.find((s) => s.id === form.staffId);
//   const commission =
//     svc && member
//       ? Math.round((svc.priceVnd * member.revenueShareRate) / 100)
//       : 0;

//   function upd<K extends keyof Booking>(k: K, v: Booking[K]) {
//     // form[k] = v;
//     // errs[k] = undefined;
//     setForm((p) => ({ ...p, [k]: v }));
//     setErrs((p) => ({ ...p, [k]: undefined }));
//     setConflict(false);
//   }

//   function validate() {
//     const e: Partial<Record<keyof Booking, string>> = {};
//     if (!form.customerName.trim()) e.customerName = 'Bắt buộc';
//     if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9)
//       e.phone = 'Số điện thoại không hợp lệ';
//     if (!form.serviceId) e.serviceId = 'Bắt buộc';
//     if (!form.staffId) e.staffId = 'Bắt buộc';
//     setErrs(e);
//     return !Object.keys(e).length;
//   }

//   function handleSavBooking(d: Booking) {
//     if (d.id)
//       setBookings((p) =>
//         p.map((b) => (b.id === d.id ? ({ ...b, ...d } as Booking) : b))
//       );
//     else setBookings((p) => [...p, { ...d, id: `b${Date.now()}` } as Booking]);
//   }

//   function handleSave() {
//     if (!validate()) return;
//     if (checkConflict(form, bookings)) {
//       setConflict(true);
//       return;
//     }
//     handleSavBooking(form);
//     onClose();
//   }

//   function handleDelete(id: string) {
//     setBookings((p) => p.filter((b) => b.id !== id));
//   }

//   const isEdit = Boolean(form.id);

//   return (
//     <>
//       <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
//         <SheetContent
//           side="right"
//           className="w-full sm:max-w-[420px] flex flex-col p-0 bg-card border-l border-border gap-0"
//         >
//           <SheetHeader className="px-5 py-4 border-b border-border">
//             <SheetTitle>
//               {isEdit ? 'Chỉnh sửa lịch' : 'Đặt lịch mới'}
//             </SheetTitle>
//           </SheetHeader>

//           <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
//             {conflict && (
//               <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm">
//                 <AlertTriangle className="size-4 shrink-0 mt-0.5" />
//                 <p>
//                   Khung giờ bị trùng — vui lòng chọn giường hoặc khung giờ khác.
//                 </p>
//               </div>
//             )}

//             <Field label="Tên khách hàng *" error={errs.customerName}>
//               <Input
//                 value={form.customerName}
//                 onChange={(e) => upd('customerName', e.target.value)}
//                 placeholder=""
//               />
//             </Field>

//             <Field label="Số điện thoại *" error={errs.phone}>
//               <Input
//                 value={form.phone}
//                 onChange={(e) => upd('phone', e.target.value)}
//                 placeholder=""
//               />
//             </Field>

//             <Field label="Dịch vụ *" error={errs.serviceId}>
//               <Select
//                 value={form.serviceId}
//                 onValueChange={(v) => upd('serviceId', v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Chọn dịch vụ..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SERVICES.map((s) => (
//                     <SelectItem key={s.id} value={s.id}>
//                       {s.nameVi} — {s.durationMin}p — {formatPrice(s.priceVnd)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>

//             <Field label="Giường *">
//               <ToggleGroup
//                 type="single"
//                 value={form.bedNumber}
//                 onValueChange={(v) =>
//                   v && upd('bedNumber', v as '1' | '2' | '3' | '4')
//                 }
//                 className="w-full"
//               >
//                 {(['1', '2', '3', '4'] as const).map((b) => (
//                   <ToggleGroupItem
//                     key={b}
//                     value={b}
//                     variant="outline"
//                     className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
//                   >
//                     {b}
//                   </ToggleGroupItem>
//                 ))}
//               </ToggleGroup>
//             </Field>

//             <DatePickerField
//               label="Ngày *"
//               value={form.date}
//               onChange={(d) => upd('date', d)}
//             />

//             <Field label="Giờ bắt đầu *">
//               <Select
//                 value={form.startTime}
//                 onValueChange={(v) => upd('startTime', v)}
//               >
//                 <SelectTrigger className="font-mono">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {TIME_SLOTS.map((t) => (
//                     <SelectItem key={t} value={t} className="font-mono">
//                       {t}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>

//             <Field label="Kỹ thuật viên *" error={errs.staffId}>
//               <Select
//                 value={form.staffId}
//                 onValueChange={(v) => upd('staffId', v)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Chọn KTV..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {staff.map((s) => (
//                     <SelectItem key={s.id} value={s.id}>
//                       {s.name} ({s.revenueShareRate}%)
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>

//             <Field label="Trạng thái">
//               <Select
//                 value={form.status}
//                 onValueChange={(v) => upd('status', v as BookingStatus)}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="open">Mở</SelectItem>
//                   <SelectItem value="upcoming">Sắp tới</SelectItem>
//                   <SelectItem value="in_progress">Đang làm</SelectItem>
//                   <SelectItem value="done">Xong</SelectItem>
//                 </SelectContent>
//               </Select>
//             </Field>

//             <Field label="Ghi chú">
//               <textarea
//                 className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
//                 rows={2}
//                 value={form.note}
//                 onChange={(e) => upd('note', e.target.value)}
//                 placeholder="Khách thích nước ấm..."
//               />
//             </Field>

//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Giá tiền">
//                 <Input
//                   value={svc ? formatPrice(svc.priceVnd) : '—'}
//                   readOnly
//                   className="font-mono text-muted-foreground"
//                 />
//               </Field>
//               <Field label="Hoa hồng">
//                 <Input
//                   value={commission > 0 ? formatPrice(commission) : '—'}
//                   readOnly
//                   className="font-mono text-primary"
//                 />
//               </Field>
//             </div>
//           </div>

//           <SheetFooter className="px-5 py-4 border-t border-border flex-row items-center gap-2">
//             {isEdit && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
//                 onClick={() => setDelOpen(true)}
//               >
//                 <Trash2 className="size-3.5" /> Xoá
//               </Button>
//             )}
//             <Button variant="outline" size="sm" onClick={onClose}>
//               Hủy
//             </Button>
//             <Button
//               size="sm"
//               onClick={handleSave}
//               className="bg-primary text-primary-foreground hover:bg-primary/90"
//             >
//               <Save className="size-3.5" /> Lưu
//             </Button>
//           </SheetFooter>
//         </SheetContent>
//       </Sheet>

//       <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Xoá lịch đặt?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Hành động này không thể hoàn tác.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Hủy</AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               onClick={() => {
//                 if (form.id) {
//                   handleDelete(form.id);
//                   setDelOpen(false);
//                   onClose();
//                 }
//               }}
//             >
//               Xoá
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

// export function Scheduler() {
//   const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
//   const [date, setDate] = useState<Date>(TODAY);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [active, setActive] = useState<Booking | null>(null);

//   function openNew() {
//     setActive(null);
//     setDrawerOpen(true);
//   }
//   function openEdit(b: Booking) {
//     setActive(b);
//     setDrawerOpen(true);
//   }

//   const dayCount = bookings.filter((b) => isSameDay(b.date, date)).length;

//   return (
//     <div className="flex flex-col h-[calc(100vh-3.5rem)]">
//       <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setDate((d) => addDays(d, -1))}
//             className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
//           >
//             <ChevronLeft className="size-4" />
//           </button>
//           <div>
//             <h1 className="font-semibold text-sm text-foreground capitalize">
//               {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
//             </h1>
//             <p className="text-xs text-muted-foreground">{dayCount} lịch đặt</p>
//           </div>
//           <button
//             onClick={() => setDate((d) => addDays(d, 1))}
//             className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
//           >
//             <ChevronRight className="size-4" />
//           </button>
//         </div>
//         <Button
//           size="sm"
//           onClick={openNew}
//           className="bg-primary text-primary-foreground hover:bg-primary/90"
//         >
//           <Plus className="size-4" /> Đặt lịch mới
//         </Button>
//       </div>

//       <div className="flex-1 overflow-auto p-4 md:p-6">
//         <BookingTimeline
//           bookings={bookings}
//           selectedDate={date}
//           onBlockClick={openEdit}
//         />
//       </div>

//       <div className="px-5 py-2.5 border-t border-border flex flex-wrap gap-4 shrink-0">
//         {(['open', 'upcoming', 'in_progress', 'done'] as BookingStatus[]).map(
//           (s) => {
//             const c = statusCfg(s);
//             return (
//               <div key={s} className="flex items-center gap-1.5">
//                 <div
//                   className="size-2.5 rounded-full"
//                   style={{ backgroundColor: c.color }}
//                 />
//                 <span className="text-xs text-muted-foreground">{c.label}</span>
//               </div>
//             );
//           }
//         )}
//       </div>

//       <BookingDrawer
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//         booking={active}
//       />
//     </div>
//   );
// }

export function DatePickerField({
  value,
  onChange,
  label,
}: {
  value: Date | undefined;
  onChange: (d: Date) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 w-full rounded-md border border-input bg-input-background px-3 h-9 text-sm text-foreground hover:bg-secondary/60 transition-colors text-left">
            <Calendar className="size-4 text-muted-foreground flex-shrink-0" />
            {value ? (
              format(value, 'dd/MM/yyyy', { locale: vi })
            ) : (
              <span className="text-muted-foreground">Chọn ngày</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (d) {
                onChange(d);
                setOpen(false);
              }
            }}
            locale={vi}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function BookingBlock({
  booking,
  onClick,
  readOnly,
}: {
  booking: Partial<Booking>;
  onClick?: () => void;
  readOnly: boolean;
}) {
  const svc = SERVICES.find((s) => s.id === booking.serviceId);
  if (!svc) return null;
  const left =
    ((timeToMin(booking.startTime!) - TIMELINE_START_MIN) /
      TIMELINE_TOTAL_MIN) *
    100;
  const width = (svc.durationMin / TIMELINE_TOTAL_MIN) * 100;
  const cfg = statusCfg(booking.status!);
  return (
    <div
      className={cn(
        'absolute top-1 bottom-1 rounded-lg border overflow-hidden min-w-[56px] transition-all',
        !readOnly && 'cursor-pointer hover:brightness-110'
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        backgroundColor: cfg.bg,
        borderColor: cfg.color,
      }}
      onClick={readOnly ? undefined : onClick}
    >
      <div className="px-2 pt-1 h-full flex flex-col justify-center gap-0.5">
        <p className="text-xs font-semibold text-foreground truncate leading-none">
          {booking.customerName}
        </p>
        <p
          className="text-[10px] truncate font-medium"
          style={{ color: cfg.color }}
        >
          {svc.subName}
        </p>
      </div>
      <div
        className="absolute top-1 right-1.5 size-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
    </div>
  );
}

export function BookingTimeline({
  bookings,
  onBlockClick,
  readOnly = false,
}: {
  bookings: Partial<Booking>[];
  onBlockClick?: (b: Partial<Booking>) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 860 }}>
        {/* Time header */}
        <div className="flex ml-[88px] mb-2">
          {HOUR_MARKS.map((h) => (
            <div
              key={h}
              className="flex-1 text-[11px] font-mono text-muted-foreground text-center select-none"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Bed rows */}
        <div className="space-y-2">
          {BEDS.map((bed) => (
            <div key={bed} className="flex items-center gap-2">
              <div className="w-[80px] flex-shrink-0 flex justify-center">
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium px-2 py-1"
                >
                  Giường {bed}
                </Badge>
              </div>

              <div className="flex-1 relative h-[72px] rounded-lg border border-border bg-secondary/40">
                {HOUR_MARKS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-border/40"
                    style={{
                      left: `${(i / (HOUR_MARKS.length - 1)) * 100}%`,
                    }}
                  />
                ))}
                {bookings.length > 0 &&
                  bookings
                    .filter((b) => b.bedNumber === bed)
                    .map((b) => (
                      <BookingBlock
                        key={b.id}
                        booking={b}
                        onClick={() => onBlockClick?.(b)}
                        readOnly={readOnly}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BookingDrawer({
  open,
  onClose,
  //   booking,
  bookings,
  staff,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  //   booking: Booking | null;
  bookings: Partial<Booking>[];
  staff: Staff[];
  onSave: (d: Booking) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<Booking>(EMPTY_DRAFT);
  const [errs, setErrs] = useState<Partial<Record<keyof Booking, string>>>({});
  const [conflict, setConflict] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  //   React.useEffect(() => {
  //     if (open) {
  //       setForm(
  //         booking
  //           ? {
  //               id: booking.id,
  //               customerName: booking.customerName,
  //               phone: booking.phone,
  //               serviceId: booking.serviceId,
  //               bedNumber: booking.bedNumber,
  //               date: booking.date,
  //               startTime: booking.startTime,
  //               staffId: booking.staffId,
  //               note: booking.note ?? '',
  //               status: booking.status,
  //             }
  //           : EMPTY_DRAFT
  //       );
  //       setErrs({});
  //       setConflict(false);
  //     }
  //   }, [open, booking]);

  const svc = SERVICES.find((s) => s.id === form.serviceId);
  const member = staff.find((s) => s.id === form.staffId);
  const commission =
    svc && member
      ? Math.round((svc.priceVnd * member.revenueShareRate) / 100)
      : 0;

  function upd<K extends keyof Booking>(k: K, v: Booking[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: undefined }));
    setConflict(false);
  }

  function validate() {
    const e: Partial<Record<keyof Booking, string>> = {};
    if (!form.customerName.trim()) e.customerName = 'Bắt buộc';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9)
      e.phone = 'Số điện thoại không hợp lệ';
    if (!form.serviceId) e.serviceId = 'Bắt buộc';
    if (!form.staffId) e.staffId = 'Bắt buộc';
    setErrs(e);
    return !Object.keys(e).length;
  }

  function handleSave() {
    if (!validate()) return;
    if (checkConflict(form, bookings)) {
      setConflict(true);
      return;
    }
    onSave(form);
    onClose();
  }

  const isEdit = Boolean(form.id);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[420px] flex flex-col p-0 bg-card border-l border-border gap-0"
        >
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle>
              {isEdit ? 'Chỉnh sửa lịch' : 'Đặt lịch mới'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {conflict && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />
                <p>
                  Khung giờ bị trùng — vui lòng chọn giường hoặc khung giờ khác.
                </p>
              </div>
            )}

            <Field label="Tên khách hàng *" error={errs.customerName}>
              <Input
                value={form.customerName}
                onChange={(e) => upd('customerName', e.target.value)}
                placeholder=""
              />
            </Field>

            <Field label="Số điện thoại *" error={errs.phone}>
              <Input
                value={form.phone}
                onChange={(e) => upd('phone', e.target.value)}
                placeholder="0934 567 890"
              />
            </Field>

            <Field label="Dịch vụ *" error={errs.serviceId}>
              <Select
                value={form.serviceId}
                onValueChange={(v) => upd('serviceId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dịch vụ..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nameVi} — {s.durationMin}p — {formatPrice(s.priceVnd)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Giường *">
              <ToggleGroup
                type="single"
                value={form.bedNumber}
                onValueChange={(v) =>
                  v && upd('bedNumber', v as '1' | '2' | '3' | '4')
                }
                className="w-full"
              >
                {BEDS.map((b) => (
                  <ToggleGroupItem
                    key={b}
                    value={b}
                    variant="outline"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
                  >
                    {b}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <DatePickerField
              label="Ngày *"
              value={form.date}
              onChange={(d) => upd('date', d)}
            />

            <Field label="Giờ bắt đầu *">
              <Select
                value={form.startTime}
                onValueChange={(v) => upd('startTime', v)}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t} className="font-mono">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Kỹ thuật viên *" error={errs.staffId}>
              <Select
                value={form.staffId}
                onValueChange={(v) => upd('staffId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn KTV..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.revenueShareRate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Trạng thái">
              <Select
                value={form.status}
                onValueChange={(v) => upd('status', v as BookingStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Mở</SelectItem>
                  <SelectItem value="upcoming">Sắp tới</SelectItem>
                  <SelectItem value="in_progress">Đang làm</SelectItem>
                  <SelectItem value="done">Xong</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Ghi chú">
              <textarea
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                rows={2}
                value={form.note}
                onChange={(e) => upd('note', e.target.value)}
                placeholder="Khách thích nước ấm..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Giá tiền">
                <Input
                  value={svc ? formatPrice(svc.priceVnd) : '—'}
                  readOnly
                  className="font-mono text-muted-foreground"
                />
              </Field>
              <Field label="Hoa hồng">
                <Input
                  value={commission > 0 ? formatPrice(commission) : '—'}
                  readOnly
                  className="font-mono text-primary"
                />
              </Field>
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t border-border flex-row items-center gap-2">
            {isEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
                onClick={() => setDelOpen(true)}
              >
                <Trash2 className="size-3.5" /> Xoá
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-3.5" /> Lưu
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá lịch đặt?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (form.id) {
                  onDelete(form.id);
                  setDelOpen(false);
                  onClose();
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function Scheduler({ staff }: { staff: Promise<Staff[]> }) {
  const [date, setDate] = useState<Date>(TODAY);
  const [bookings, setBookings] = useState<Partial<Booking>[]>([]);
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState<Partial<Booking | null>>(null);
  const allStaff = use(staff);

  function handleDateChange(newDate: Date) {
    setDate(newDate);
    startTransition(async () => {
      const fresh = await findTodayBookings();
      setBookings(fresh);
    });
  }

  function openNew() {
    setActive(null);
    setDrawerOpen(true);
  }

  function openEdit(b: Partial<Booking>) {
    setActive(b);
    setDrawerOpen(true);
  }

  function handleSave(d: Booking) {
    upsertBooking(d);
  }

  function handleDelete(id: string) {
    softDeleteBookingById(id);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div
          className={`flex items-center gap-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <button
            // onClick={() => setDate((d) => addDays(d, -1))}
            onClick={() => {
              handleDateChange(addDays(date, -1));
            }}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div>
            <h1 className="font-semibold text-sm text-foreground capitalize">
              {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {bookings.length} lịch đặt
            </p>
          </div>
          <button
            // onClick={() => setDate((d) => addDays(d, 1))}
            onClick={() => handleDateChange(addDays(date, 1))}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <Button
          size="sm"
          onClick={openNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Đặt lịch mới
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <BookingTimeline bookings={bookings} onBlockClick={openEdit} />
      </div>

      <div className="px-5 py-2.5 border-t border-border flex flex-wrap gap-4 flex-shrink-0">
        {(['open', 'upcoming', 'in_progress', 'done'] as BookingStatus[]).map(
          (s) => {
            const c = statusCfg(s);
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            );
          }
        )}
      </div>

      <BookingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        // booking={active}
        bookings={bookings}
        staff={allStaff}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
