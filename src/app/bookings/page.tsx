// import { Booking } from '@/types';
// import { format, addDays, isSameDay } from 'date-fns';
// import { vi } from 'date-fns/locale';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { statusCfg } from '@/constants/config';
// import { TODAY, INIT_BOOKINGS } from '@/constants/seed';
// import { BookingStatus } from '@/types';
// import { BookingTimeline, BookingDrawer } from './_components';

import { findAllStaff } from '@/lib/data/staff';
import { Scheduler } from './components';

// ─── BOOKING TIMELINE ─────────────────────────────────────────────────────────

// export default function PublicBookingPage() {
//   const [form, setForm] = useState({
//     name: '',
//     phone: '',
//     serviceId: '',
//     date: undefined as Date | undefined,
//     startTime: '09:00',
//   });
//   const [errs, setErrs] = useState<Record<string, string>>({});
//   const [done, setDone] = useState(false);

//   function validate() {
//     const e: Record<string, string> = {};
//     if (!form.name.trim()) e.name = 'Bắt buộc';
//     if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9)
//       e.phone = 'Số điện thoại không hợp lệ';
//     if (!form.serviceId) e.serviceId = 'Bắt buộc';
//     if (!form.date) e.date = 'Vui lòng chọn ngày';
//     setErrs(e);
//     return !Object.keys(e).length;
//   }

//   if (done) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center px-4">
//         <div className="text-center max-w-sm">
//           <CheckCircle2
//             className="size-16 mx-auto mb-6"
//             style={{ color: '#4ADE80' }}
//           />
//           <h2 className="text-2xl font-semibold text-foreground mb-3">
//             Đặt lịch thành công!
//           </h2>
//           <p className="text-muted-foreground text-sm leading-relaxed">
//             Chúng tôi sẽ xác nhận lịch của bạn sớm nhất.
//           </p>
//           <Button
//             className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
//             onClick={() => {
//               setDone(false);
//               setForm({
//                 name: '',
//                 phone: '',
//                 serviceId: '',
//                 date: undefined,
//                 startTime: '09:00',
//               });
//             }}
//           >
//             Đặt lịch khác
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-[480px]">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/15 mb-4">
//             <span className="text-xl text-primary">✦</span>
//           </div>
//           <h1 className="text-2xl font-semibold text-foreground">
//             Tiệm Gội Đầu Dưỡng Sinh
//           </h1>
//           <p className="text-muted-foreground text-sm mt-1">Đặt lịch dịch vụ</p>
//         </div>

//         <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
//           <div className="space-y-4">
//             <Field label="Tên của bạn *" error={errs.name}>
//               <Input
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 placeholder="Nguyễn Thị Lan"
//               />
//             </Field>
//             <Field label="Số điện thoại *" error={errs.phone}>
//               <Input
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, phone: e.target.value }))
//                 }
//                 placeholder="0901 234 567"
//               />
//             </Field>
//             <Field label="Dịch vụ *" error={errs.serviceId}>
//               <Select
//                 value={form.serviceId}
//                 onValueChange={(v) => setForm((f) => ({ ...f, serviceId: v }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Chọn dịch vụ..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SERVICES.map((s) => (
//                     <SelectItem key={s.key} value={s.key}>
//                       {s.nameVi} — {s.durationMin}p — {formatPrice(s.priceVnd)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Field>
//             <div>
//               <DatePickerField
//                 label="Ngày mong muốn *"
//                 value={form.date}
//                 onChange={(d) => setForm((f) => ({ ...f, date: d }))}
//               />
//               {errs.date && (
//                 <p className="text-xs text-destructive mt-1">{errs.date}</p>
//               )}
//             </div>
//             <Field label="Giờ mong muốn">
//               <Select
//                 value={form.startTime}
//                 onValueChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
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

//             <button
//               className="w-full h-11 rounded-lg font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors mt-2"
//               onClick={() => {
//                 if (validate()) setDone(true);
//               }}
//             >
//               Đặt lịch →
//             </button>
//           </div>
//         </div>

//         <p className="text-center text-xs text-muted-foreground mt-6">
//           Có thắc mắc? Gọi{' '}
//           <span className="font-mono text-foreground">0901 234 567</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function AdminBookingsPage() {
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

export default async function BookingPage() {
  const staff = findAllStaff();
  //   const todayQueryParam = { date: new Date() };
  //   const bookings = findAllBookings({ where: todayQueryParam });

  return (
    <div>
      <Scheduler staff={staff} />
    </div>
  );
}

// export default function TechSchedulePage() {
//   const me = INIT_STAFF.find((s) => s.id === TECH_STAFF_ID)!;
//   const [date, setDate] = useState<Date>(TODAY);
//   const myBookings = INIT_BOOKINGS.filter((b) => b.staffId === TECH_STAFF_ID);
//   const dayList = myBookings
//     .filter((b) => isSameDay(b.date, date))
//     .sort((a, b) => a.startTime.localeCompare(b.startTime));

//   return (
//     <div className="p-5 md:p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-xl font-semibold text-foreground">
//             Lịch của tôi
//           </h1>
//           <p className="text-sm text-muted-foreground">{me.name}</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setDate((d) => addDays(d, -1))}
//             className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
//           >
//             <ChevronLeft className="size-4" />
//           </button>
//           <span className="text-sm font-mono font-medium text-foreground">
//             {format(date, 'dd/MM/yyyy')}
//           </span>
//           <button
//             onClick={() => setDate((d) => addDays(d, 1))}
//             className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
//           >
//             <ChevronRight className="size-4" />
//           </button>
//         </div>
//       </div>

//       <div className="mb-6">
//         <BookingTimeline bookings={myBookings} selectedDate={date} readOnly />
//       </div>

//       {dayList.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-16 text-center">
//           <Calendar className="size-12 text-muted-foreground mb-4" />
//           <p className="text-muted-foreground mb-2">Chưa có lịch hôm nay</p>
//           <p className="text-sm text-muted-foreground">
//             Liên hệ quản lý để được phân công
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
//             Chi tiết lịch
//           </h2>
//           {dayList.map((b) => {
//             const svc = SERVICES.find((s) => s.key === b.serviceId);
//             const st = statusCfg(b.status);
//             return (
//               <div
//                 key={b.id}
//                 className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
//               >
//                 <div className="text-center shrink-0">
//                   <p className="font-mono text-sm font-semibold text-foreground">
//                     {b.startTime}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {svc?.durationMin}p
//                   </p>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-foreground text-sm">
//                     {b.customerName}
//                   </p>
//                   <p className="text-xs text-muted-foreground truncate">
//                     {svc?.nameVi}
//                   </p>
//                 </div>
//                 <div className="text-right shrink-0">
//                   <span
//                     className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
//                     style={{ backgroundColor: st.bg, color: st.color }}
//                   >
//                     {st.label}
//                   </span>
//                   <p className="text-xs font-mono text-muted-foreground mt-1">
//                     Giường {b.bedNumber}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
