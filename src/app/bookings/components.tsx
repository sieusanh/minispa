'use client';

import { useState, useEffect, useTransition, use, useRef } from 'react';
import { format, addDays, compareAsc, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar,
  CalendarDays,
  Trash2,
  AlertTriangle,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  LoaderCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoPopup } from '@/components/ui/info-popup';

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
import {
  EMPTY_DRAFT,
  SERVICES,
  ADMIN,
  statusCfg,
  REFRESH_INTERVAL_MS,
  VACANCY_BUFFERED_MINS,
  RIGHT_NOW_VACANCY_MINS,
} from '@/constants/config';

import {
  TIMELINE_START_MIN,
  TIMELINE_TOTAL_MIN,
  TOTAL_WIDTH_PX,
  HOUR_WIDTH_PX,
  HOUR_HEIGHT_PX,
} from '@/constants/time';
import {
  checkConflict,
  TIME_SLOTS,
  timeToMin,
  HOUR_MARKS,
  MOBILE_HOUR_MARKS,
  convertTimeToPM,
  getEndTime,
  compareDateString,
  timeToLeftPx,
  timeToTopPx,
  durationToWidthPx,
  durationToHeightPx,
  getMinuteDistance,
  getToday,
} from '@/utils/time';
import { formatPrice } from '@/utils/price';
import {
  Booking,
  BookingStatus,
  VacancyState,
  Staff,
  BedKey,
  UserRole,
} from '@/types';
import { cn } from '@/utils/common';
import { deriveStatus, runRealtimeBookings } from '@/utils/bookings';
import {
  upsertBooking,
  bulkUpdateBooking,
  softDeleteBookingById,
  findBookingsByDate,
} from '@/lib/data/bookings';

export function DatePickerField({
  value,
  onChange,
  label,
  disabled,
}: {
  value: Date | undefined;
  onChange: (d: Date) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled ? undefined : setOpen}
      >
        {/* <Popover open={open} onOpenChange={setOpen}> */}
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
            className={cn(
              'flex items-center gap-2 w-full rounded-md border border-input bg-input-background px-3 h-9 text-sm text-foreground hover:bg-secondary/60 transition-colors text-left',
              disabled &&
                'cursor-not-allowed opacity-50 hover:bg-input-background'
            )}
          >
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

// export function BookingBlock({
//   booking,
//   onClick,
//   readOnly,
// }: {
//   booking: Partial<Booking>;
//   onClick?: () => void;
//   readOnly: boolean;
// }) {
//   const svc = SERVICES.find((s) => s.id === booking.serviceId);
//   if (!svc) return null;
//   const left =
//     ((timeToMin(booking.startTime!) - TIMELINE_START_MIN) /
//       TIMELINE_TOTAL_MIN) *
//     100;
//   const width = (svc.durationMin / TIMELINE_TOTAL_MIN) * 100;
//   const cfg = statusCfg(booking.status!);

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
//         <p
//           className="text-[10px] truncate font-medium"
//           style={{ color: cfg.color }}
//         >
//           {convertTimeToPM(booking.startTime!)} -{' '}
//           {convertTimeToPM(
//             getEndTime(booking.startTime!, svc.durationMin)
//           )}
//         </p>
//         <p
//           className="text-[10px] truncate font-medium"
//           style={{ color: cfg.color }}
//         >
//           {booking.staffName}
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
//   onBlockClick,
//   readOnly = false,
// }: {
//   bookings: Partial<Booking>[];
//   onBlockClick?: (b: Partial<Booking>) => void;
//   readOnly?: boolean;
// }) {
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
//           {Object.values(BedKey).map((bed) => (
//             <div key={bed} className="flex items-center gap-2">
//               <div className="w-[80px] flex-shrink-0 flex justify-center">
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
//                     style={{
//                       left: `${(i / (HOUR_MARKS.length - 1)) * 100}%`,
//                     }}
//                   />
//                 ))}
//                 {bookings.length > 0 &&
//                   bookings
//                     .filter((b) => b.bedKey === bed)
//                     .map((b) => {
//                       const svc = SERVICES.find((s) => s.id === b.serviceId);
//                       if (!svc) return null;
//                       return (
//                         // <BookingBlock
//                         //   //   key={b.id}
//                         //   key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
//                         //   booking={b}
//                         //   onClick={() => onBlockClick?.(b)}
//                         //   readOnly={readOnly}
//                         // />
//                         <div
//                           key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
//                           className="absolute top-1 bottom-1"
//                           style={{
//                             left: timeToLeftPx(b.startTime!), // ← px, not %
//                             width: durationToPx(svc.durationMin), // ← px, not %
//                           }}
//                         >
//                           <BookingBlock
//                             booking={b}
//                             onClick={() => onBlockClick?.(b)}
//                             readOnly={readOnly}
//                           />
//                         </div>
//                       );
//                     })}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

export function BookingBlock({
  booking,
  onClick,
  readOnly,
  isMobile,
}: {
  booking: Partial<Booking>;
  onClick?: () => void;
  readOnly: boolean;
  isMobile: boolean;
}) {
  const svc = SERVICES.find((s) => s.id === booking.serviceId);
  if (!svc) return null;
  const {
    id,
    bedKey,
    startTime,
    date,
    status,
    customerName,
    staffName,
    staffId,
    note,
  } = booking;
  const cfg = statusCfg(status!);
  const startTimeStr = convertTimeToPM(startTime!);
  const endTimeStr = convertTimeToPM(getEndTime(startTime!, svc.durationMin));
  const isFastService = svc.durationMin <= 50;
  return (
    <div
      //   key={id ?? `${bedKey}-${startTime}-${date}`}
      //   className="absolute md:top-1 md:bottom-1 left-71 right-71"
      //   className="absolute md:top-1 md:bottom-1"
      className="absolute rounded-md md:px-1.5 md:py-1 text-[10px] overflow-hidden md:top-1 md:bottom-1 md:w-auto h-full w-full"
      onClick={onClick}
      style={{
        ...(isMobile
          ? {
              top: timeToTopPx(startTime!),
              height: durationToHeightPx(svc.durationMin),
              left: 2,
              right: 2,
            }
          : {
              left: timeToLeftPx(startTime!),
              width: durationToWidthPx(svc.durationMin),
            }),
        // fontSize: svc.durationMin <= 35 ? 10 : 16,
      }}
    >
      <div
        className={cn(
          // No absolute/left/width here — parent wrapper handles position
          //   'relative h-full rounded-lg border overflow-hidden min-w-[56px]',
          'relative h-full rounded-lg border overflow-hidden md:min-w-[36px] max-w-full',
          'transition-all',
          !readOnly && 'cursor-pointer hover:brightness-110'
        )}
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.color,
        }}
        onClick={readOnly ? undefined : onClick}
      >
        {/* Status dot */}
        <div
          className="absolute top-1 right-1.5 size-1.5 rounded-full"
          style={{ backgroundColor: cfg.color }}
        />

        {/* Content */}
        <div
          className="md:px-2 px-1 pt-1 h-full flex flex-col justify-center gap-0.5"
          // style={{ fontSize: svc.durationMin <= 35 ? 10 : 16 }}
          //   style={{ fontSize: '20px !important' }}
        >
          <p
            // className="text-xs font-semibold text-foreground truncate leading-none"
            className={`${isFastService ? '' : 'text-xs'} font-semibold text-foreground leading-tight line-clamp-2 break-words`}
          >
            {customerName}
          </p>
          <p
            className="text-[10px] truncate font-medium"
            // className="text-[10px] font-medium leading-tight line-clamp-1 break-words"
            // className={cn(
            //   'truncate font-medium',
            //   svc.durationMin <= 35 ? 'text-[8px]' : 'text-[10px]'
            // )}
            style={{ color: cfg.color }}
          >
            {svc.subName}
          </p>

          <p
            className="text-[10px] truncate font-medium"
            style={{ color: cfg.color, whiteSpace: 'pre-wrap' }}
          >
            {`${startTimeStr} ${isFastService ? '' : '-'} ${endTimeStr}`}
          </p>
          <p>{staffId === ADMIN.id ? null : staffName}</p>
        </div>
        {/* <div
          className="absolute top-1 right-1.5 size-1.5 rounded-full"
          style={{ backgroundColor: cfg.color }}
        /> */}
      </div>
    </div>
  );
}

export function BookingTimeline({
  bookings,
  onBlockClick,
  readOnly = false,
  isMobile,
}: {
  bookings: Partial<Booking>[];
  onBlockClick?: (b: Partial<Booking>) => void;
  readOnly?: boolean;
  isMobile: boolean;
}) {
  //   return (
  //     <div className="flex overflow-hidden flex-1">
  //       {/* ── Fixed left: bed labels ─────────────────────────── */}
  //       {/* Matches your existing w-[80px] flex-shrink-0 */}
  //       <div className="flex flex-col flex-shrink-0 w-[80px] border-r border-border z-10 bg-background">
  //         {/* Spacer aligned with time header height */}
  //         <div className="h-[36px] border-b border-border" />

  //         {/* Bed label rows */}
  //         {Object.values(BedKey).map((bed) => (
  //           <div
  //             key={bed}
  //             className="flex items-center justify-center h-[72px] border-b border-border"
  //           >
  //             <Badge
  //               variant="outline"
  //               className="text-[11px] font-medium px-2 py-1"
  //             >
  //               Giường {bed}
  //             </Badge>
  //           </div>
  //         ))}
  //       </div>

  //       {/* ── Scrollable right: header + grid ───────────────── */}
  //       <div className="overflow-x-auto flex-1 scrollbar-none">
  //         <div style={{ width: TOTAL_WIDTH_PX, minWidth: TOTAL_WIDTH_PX }}>
  //           {/* Time header — pixel-positioned */}
  //           <div className="relative h-[36px] border-b border-border ml-0">
  //             {HOUR_MARKS.map((h, i) => (
  //               <div
  //                 key={h}
  //                 className="absolute top-0 bottom-0 flex items-end pb-1"
  //                 style={{ left: i * HOUR_WIDTH_PX }}
  //               >
  //                 <span className="text-[11px] font-mono text-muted-foreground select-none">
  //                   {h}
  //                 </span>
  //               </div>
  //             ))}
  //           </div>

  //           {/* Bed rows */}
  //           <div className="space-y-2">
  //             {Object.values(BedKey).map((bed) => (
  //               <div key={bed} className="flex items-center gap-2">
  //                 {/* Grid row */}
  //                 <div
  //                   className="flex-1 relative h-[72px] rounded-lg border border-border bg-secondary/40"
  //                   style={{ width: TOTAL_WIDTH_PX }}
  //                 >
  //                   {/* Hour grid lines — pixel positioned */}
  //                   {HOUR_MARKS.map((h, i) => (
  //                     <div
  //                       key={h}
  //                       className="absolute top-0 bottom-0 border-l border-border/40"
  //                       style={{ left: i * HOUR_WIDTH_PX }}
  //                     />
  //                   ))}

  //                   {/* Half-hour grid lines */}
  //                   {HOUR_MARKS.slice(0, -1).map((h, i) => (
  //                     <div
  //                       key={`${h}-half`}
  //                       className="absolute top-0 bottom-0 border-l border-border/20"
  //                       style={{ left: i * HOUR_WIDTH_PX + HOUR_WIDTH_PX / 2 }}
  //                     />
  //                   ))}

  //                   {/* Booking blocks — pixel positioned */}
  //                   {bookings.length > 0 &&
  //                     bookings
  //                       .filter((b) => b.bedKey === bed)
  //                       .map((b) => {
  //                         const svc = SERVICES.find((s) => s.id === b.serviceId);
  //                         if (!svc) return null;
  //                         return (
  //                           <div
  //                             key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
  //                             className="absolute top-1 bottom-1"
  //                             style={{
  //                               left: timeToLeftPx(b.startTime!), // ← px, not %
  //                               width: durationToPx(svc.durationMin), // ← px, not %
  //                             }}
  //                           >
  //                             <BookingBlock
  //                               booking={b}
  //                               onClick={() => onBlockClick?.(b)}
  //                               readOnly={readOnly}
  //                             />
  //                           </div>
  //                         );
  //                       })}
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );

  // Current
  return isMobile ? (
    // <div className="flex flex-col overflow-hidden w-[370px]">
    // <div className="flex flex-col w-[370px] overflow-y-auto max-h-[calc(100vh-Npx)]">
    <div className="flex flex-col w-[370px] overflow-y-auto max-h-[70vh]">
      {/* Fixed top: bed labels */}
      <div
        // className="flex justify-around flex-shrink-0 w-[160px] border-r border-border z-10 bg-background"
        className="flex justify-around w-[350px] border-l border-border z-10 bg-background ml-[22px] gap-0"
      >
        {/* <div className="h-[36px] border-b border-border" /> */}
        {Object.values(BedKey).map((bed) => (
          <div key={bed}>
            <div className="flex items-center justify-center w-[6px] h-[56px]">
              <Badge variant="outline" className="text-[11px] font-medium p-1">
                Giường {bed}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable right — min-w-0 is the critical fix */}
      {/* scrollbar-none flex-1 */}
      <div className="overflow-x-auto flex border-t border-border">
        {/* Time header column */}
        <div className="relative border-b border-border top-[-4px] pl-[4px] pr-0">
          {MOBILE_HOUR_MARKS.map((h, i) => (
            <div
              key={h}
              className="absolute flex items-end pb-1"
              style={{ top: i * HOUR_HEIGHT_PX }}
            >
              <span className="text-[11px] font-mono text-muted-foreground select-none">
                {h}
              </span>
            </div>
          ))}
        </div>

        {/* Grid + bookings — merged into ONE relative container so they overlap */}
        <div
          className="relative ml-[18px]"
          //   style={{ width: 254, height: TOTAL_WIDTH_PX }}
          style={{ width: 360, height: 1000 }}
        >
          {/* Layer 1: hour grid lines — background */}
          <div className="absolute inset-0">
            {MOBILE_HOUR_MARKS.map((h, k) => (
              <div
                key={h}
                className="relative border-b border-border bg-secondary/40 w-[350px]"
                style={{ height: HOUR_HEIGHT_PX }}
              >
                {Object.values(BedKey).map((bed, i) => (
                  <div
                    key={bed}
                    className="absolute top-0 bottom-0 border-l border-border/40"
                    // style={{ left: i * 64 }}
                    style={{ left: i * 87 }}
                  />
                ))}
                {/* Half-hour grid line */}
                <div
                  key={`${h}-half`}
                  className={`absolute border-b border-border bg-secondary/20 w-[350px]`}
                  style={{ height: HOUR_HEIGHT_PX, top: HOUR_HEIGHT_PX / 2 }}
                />
              </div>
            ))}
          </div>

          {/* Layer 2: bed columns with bookings — overlaid on top of the grid */}
          <div className="absolute inset-0 flex z-10">
            {Object.values(BedKey).map((bed) => (
              <div key={bed} className="relative w-[86px] h-full mx-0.5">
                {bookings
                  .filter((b) => b.bedKey === bed)
                  .map((b) => (
                    <BookingBlock
                      key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
                      booking={b}
                      onClick={() => onBlockClick?.(b)}
                      readOnly={readOnly}
                      isMobile={isMobile}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex overflow-hidden flex-1">
      {/* Fixed left: bed labels */}
      <div className="flex flex-col flex-shrink-0 w-[80px] border-r border-border z-10 bg-background">
        <div className="h-[36px] border-b border-border" />
        {Object.values(BedKey).map((bed) => (
          <div
            key={bed}
            className="flex items-center justify-center h-[72px] border-b border-border"
            style={{ height: 72 }}
          >
            <Badge
              variant="outline"
              className="text-[11px] font-medium px-2 py-1"
            >
              Giường {bed}
            </Badge>
          </div>
        ))}
      </div>

      {/* Scrollable right — min-w-0 is the critical fix */}
      <div className="overflow-x-auto flex-1 min-w-0 scrollbar-none">
        <div style={{ width: TOTAL_WIDTH_PX, minWidth: TOTAL_WIDTH_PX }}>
          {/* Time header */}
          <div className="relative h-[36px] border-b border-border">
            {HOUR_MARKS.map((h, i) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 flex items-end pb-1"
                style={{ left: i * HOUR_WIDTH_PX }}
              >
                <span className="text-[11px] font-mono text-muted-foreground select-none">
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Bed rows — no space-y, no flex wrapper per row */}
          {Object.values(BedKey).map((bed) => (
            <div
              key={bed}
              className="relative h-[72px] border-b border-border bg-secondary/40"
              style={{ width: TOTAL_WIDTH_PX }}
            >
              {/* Hour grid lines */}
              {HOUR_MARKS.map((h, i) => (
                <div
                  key={h}
                  className="absolute top-0 bottom-0 border-l border-border/40"
                  style={{ left: i * HOUR_WIDTH_PX }}
                />
              ))}

              {/* Half-hour grid lines */}
              {HOUR_MARKS.slice(0, -1).map((h, i) => (
                <div
                  key={`${h}-half`}
                  className="absolute top-0 bottom-0 border-l border-border/20"
                  style={{ left: i * HOUR_WIDTH_PX + HOUR_WIDTH_PX / 2 }}
                />
              ))}

              {/* Booking blocks */}
              {bookings
                .filter((b) => b.bedKey === bed)
                .map((b) => (
                  <BookingBlock
                    key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
                    booking={b}
                    onClick={() => onBlockClick?.(b)}
                    readOnly={readOnly}
                    isMobile={isMobile}
                  />
                ))}
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
  bookings,
  staff,
  onSave,
  isSaving,
  date,
  readOnly,
}: {
  open: boolean;
  onClose: () => void;
  bookings: Partial<Booking>[];
  staff: Partial<Staff>[];
  onSave: (d: Partial<Booking>) => void;
  isSaving: boolean;
  date: Date;
  readOnly: boolean;
}) {
  EMPTY_DRAFT.date = date;
  const [form, setForm] = useState<Partial<Booking>>(EMPTY_DRAFT);
  const [errs, setErrs] = useState<Partial<Record<keyof Booking, string>>>({});
  const [conflict, setConflict] = useState(false);

  function upd<K extends keyof Booking>(k: K, v: Booking[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: undefined }));
    setConflict(false);
  }

  function validate() {
    const e: Partial<Record<keyof Booking, string>> = {};
    if (!form.customerName!.trim()) e.customerName = 'Bắt buộc';
    // if (!form.phone!.trim() || form.phone!.replace(/\D/g, '').length < 9)
    //   e.phone = 'Số điện thoại không hợp lệ';
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

    const savedBooking = { ...form };
    savedBooking.status = deriveStatus(savedBooking);
    onSave(savedBooking);
    handleClose();
  }

  function handleClose() {
    onClose();
    setForm(EMPTY_DRAFT);
    setErrs({});
  }

  return (
    <>
      {/* <Sheet open={open} onOpenChange={(v) => !v && onClose()}> */}
      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[420px] flex flex-col p-0 bg-card border-l border-border gap-0"
        >
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle>{'Đặt lịch mới'}</SheetTitle>
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

            <Field
              label="Tên khách hàng *"
              error={errs.customerName}
              readOnly={readOnly}
            >
              <Input
                value={form.customerName}
                readOnly={readOnly}
                onChange={(e) => upd('customerName', e.target.value)}
                placeholder=""
              />
            </Field>

            {/* <Field label="Số điện thoại *" error={errs.phone}>
              <Input
                value={form.phone}
                onChange={(e) => upd('phone', e.target.value)}
                placeholder=""
              />
            </Field> */}

            <Field label="Dịch vụ *" error={errs.serviceId}>
              <Select
                value={form.serviceId}
                // defaultValue={SERVICES[2]?.id}
                onValueChange={(v) => {
                  upd('serviceId', v);
                  const price = SERVICES.find((s) => s.id === v)!.priceVnd;
                  upd('price', price);
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dịch vụ..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id!}>
                      {s.nameVi} — {s.durationMin}p — {formatPrice(s.priceVnd)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Giường *">
              <ToggleGroup
                type="single"
                value={form.bedKey}
                onValueChange={(v: BedKey) => v && upd('bedKey', v)}
                className="w-full"
                disabled={readOnly}
              >
                {Object.values(BedKey).map((b) => (
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

            {/* <DatePickerField
              label="Ngày *"
              //   value={date || form.date!}
              value={form.date! || date}
              onChange={(d) => upd('date', d || date)}
              disabled={readOnly}
            /> */}

            <Field label="Giờ bắt đầu *">
              {/* <Select
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
              </Select> */}
              <Input
                className="max-w-sm"
                // type="number"
                type="time"
                // min="8"
                // max="21"
                // placeholder="09:00"
                // value={`${form.startTime!.split(':')[0]}:${form.startTime!.split(':')[1]}`}
                value={form.startTime}
                onChange={(e) => upd('startTime', e.target.value)}
                required
                readOnly={readOnly}
              />
              {/* <span>:</span>
              <Input
                className="max-w-sm"
                type="number"
                min="0"
                max="59"
                placeholder=""
                value={form.startTime!.split(':')[1]}
                onChange={(e) => upd('customerName', e.target.value)}
                required
              /> */}
            </Field>

            <Field label="Kỹ thuật viên *" error={errs.staffId}>
              <Select
                value={form.staffId}
                disabled={readOnly}
                onValueChange={(v) => {
                  const staffId = v || ADMIN.id;
                  const staffName =
                    staff.find((s) => s.id === v)?.name || ADMIN.name;

                  upd('staffId', staffId);
                  upd('staffName', staffName);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn KTV..." />
                  {/* <SelectValue placeholder={`${ADMIN.name} (0%)`} /> */}
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id!}>
                      {s.name}
                    </SelectItem>
                  ))}
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
                readOnly={readOnly}
              />
            </Field>
          </div>

          <SheetFooter className="px-5 py-4 border-t border-border flex-row items-center gap-2">
            {/* <Button variant="outline" size="sm" onClick={onClose}> */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              readOnly={readOnly}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
              readOnly={readOnly}
            >
              {isSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-3.5" /> Lưu
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function BookingEditDrawer({
  open,
  onClose,
  booking,
  bookings,
  staff,
  onSave,
  isSaving,
  onDelete,
  isDeleting,
  readOnly,
}: {
  open: boolean;
  onClose: () => void;
  booking: Partial<Booking>;
  bookings: Partial<Booking>[];
  staff: Partial<Staff>[];
  onSave: (d: Partial<Booking>) => void;
  isSaving: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  readOnly: boolean;
}) {
  //   const [form, setForm] = useState<Partial<Booking>>(
  //     open ? booking : EMPTY_DRAFT
  //   );
  const [form, setForm] = useState<Partial<Booking>>(booking);
  const [errs, setErrs] = useState<Partial<Record<keyof Booking, string>>>({});
  const [conflict, setConflict] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const svc = SERVICES.find((s) => s.id === form.serviceId);
  const member = staff.find((s) => s.id === form.staffId);
  const commission =
    svc && member
      ? Math.round((svc.priceVnd * member.revenueShareRate!) / 100)
      : 0;

  function upd<K extends keyof Booking>(k: K, v: Booking[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: undefined }));
    setConflict(false);
  }

  function validate() {
    const e: Partial<Record<keyof Booking, string>> = {};
    if (!form.customerName!.trim()) e.customerName = 'Bắt buộc';
    // if (!form.phone!.trim() || form.phone!.replace(/\D/g, '').length < 9)
    //   e.phone = 'Số điện thoại không hợp lệ';
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

    const savedBooking = { ...form };
    savedBooking.status = deriveStatus(savedBooking);
    onSave(savedBooking);
    handleClose();

    // onSave(form);
    // onClose();
  }

  function handleDelete(id: string) {
    onDelete(id);
    setDelOpen(false);
    handleClose();
  }

  function handleClose() {
    onClose();
    setErrs({});
  }

  return (
    <>
      {/* <Sheet open={open} onOpenChange={(v) => !v && onClose()}> */}
      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[420px] flex flex-col p-0 bg-card border-l border-border gap-0"
        >
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle>{'Chỉnh sửa lịch'}</SheetTitle>
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
                readOnly={readOnly}
                onChange={(e) => upd('customerName', e.target.value)}
                placeholder=""
              />
            </Field>

            {/* <Field label="Số điện thoại *" error={errs.phone}>
              <Input
                value={form.phone}
                onChange={(e) => upd('phone', e.target.value)}
                placeholder="0934 567 890"
              />
            </Field> */}

            <Field label="Dịch vụ *" error={errs.serviceId}>
              <Select
                value={form.serviceId}
                onValueChange={(v) => {
                  upd('serviceId', v);
                  const price = SERVICES.find((s) => s.id === v)!.priceVnd;
                  upd('price', price);
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dịch vụ..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id!}>
                      {s.nameVi} — {s.durationMin}p — {formatPrice(s.priceVnd)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Giường *">
              <ToggleGroup
                type="single"
                value={form.bedKey}
                onValueChange={(v: BedKey) => v && upd('bedKey', v)}
                className="w-full"
                disabled={readOnly}
              >
                {Object.values(BedKey).map((b) => (
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

            {/* <DatePickerField
              label="Ngày *"
              value={form.date!}
              onChange={(d) => upd('date', d)}
              disabled={readOnly}
            /> */}

            <Field label="Giờ bắt đầu *">
              <Input
                className="max-w-sm"
                type="time"
                value={form.startTime}
                onChange={(e) => upd('startTime', e.target.value)}
                required
                readOnly={readOnly}
              />
            </Field>

            <Field label="Kỹ thuật viên *" error={errs.staffId}>
              <Select
                value={form.staffId}
                disabled={readOnly}
                onValueChange={(v) => {
                  const staffId = v || ADMIN.id;
                  const staffName =
                    staff.find((s) => s.id === v)?.name || ADMIN.name;

                  upd('staffId', staffId);
                  upd('staffName', staffName);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn KTV..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id!}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Trạng thái" readOnly={readOnly}>
              <Select
                value={form.status}
                disabled={readOnly}
                onValueChange={(v) => upd('status', v as BookingStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BookingStatus.OPEN}>Mở</SelectItem>
                  <SelectItem value={BookingStatus.UPCOMING}>
                    Sắp tới
                  </SelectItem>
                  <SelectItem value={BookingStatus.IN_PROGRESS}>
                    Đang làm
                  </SelectItem>
                  <SelectItem value={BookingStatus.DONE}>Xong</SelectItem>
                  {/* <SelectItem value={BookingStatus.CANCELLED}>Huỷ</SelectItem> */}
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
                readOnly={readOnly}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {/* <Field label="Giá tiền">
                <Input
                  value={svc ? formatPrice(svc.priceVnd) : '—'}
                  readOnly
                  className="font-mono text-muted-foreground"
                />
              </Field> */}
              <Field label="Hoa hồng">
                <Input
                  value={commission > 0 ? formatPrice(commission) : '—'}
                  onChange={(e) => upd('commission', Number(e.target.value))}
                  readOnly
                  className="font-mono text-primary"
                />
              </Field>
            </div>
          </div>

          <SheetFooter className="px-5 py-4 border-t border-border flex-row items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
              onClick={() => setDelOpen(true)}
              readOnly={readOnly}
            >
              <Trash2 className="size-3.5" /> Xoá
            </Button>

            {/* <Button variant="outline" size="sm" onClick={onClose}> */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              readOnly={readOnly}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
              readOnly={readOnly}
            >
              {isSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-3.5" /> Lưu
                </>
              )}
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
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${isDeleting && 'opacity-60 pointer-events-none'}`}
              onClick={() => {
                if (form.id) {
                  handleDelete(form.id);
                  //   handleDelete(form.id);
                  //   setDelOpen(false);
                  //   handleClose();
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>Xoá</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function VacancyPopup({
  isOpen,
  onClose,
  bookings,
}: {
  isOpen: boolean;
  onClose: () => void;
  //   vacancies: VacancyState[];
  bookings: Partial<Booking>[];
}) {
  const [selectedOption, setSelectedOption] = useState(
    RIGHT_NOW_VACANCY_MINS.OPTION_2
  );
  const [vacancies, setVacancies] = useState<VacancyState[]>([]);
  function getRightNowVacancies(
    durationMins: number = 30,
    waitMins: number = 20
  ) {
    const rightNowVacancies: VacancyState[] = Object.values(BedKey).map(
      (bedKey) => {
        let nowStartTime: string = format(new Date(), 'HH:mm');
        let waitTime: number = 0;
        let minStartDiff: number = 24 * 60;

        const filteredBookings = bookings
          .filter((b) => b.bedKey === bedKey)
          .sort((a, b) => {
            // Use a fixed reference date (e.g., today's date) for accurate comparisons
            const baseDate = new Date().setHours(0, 0, 0, 0);

            return compareAsc(
              parse(a.startTime!, 'HH:mm', baseDate),
              parse(b.startTime!, 'HH:mm', baseDate)
            );
          });

        for (const { startTime, serviceId } of filteredBookings) {
          const endTime = getEndTime(
            startTime!,
            SERVICES.find((s) => s.id === serviceId)!.durationMin
          );

          if (
            getMinuteDistance(startTime!, nowStartTime) > 0 &&
            getMinuteDistance(nowStartTime, endTime) > 0
          ) {
            waitTime =
              getMinuteDistance(nowStartTime, endTime) + VACANCY_BUFFERED_MINS;
            if (waitTime <= waitMins) {
              nowStartTime = getEndTime(endTime, VACANCY_BUFFERED_MINS);
            } else {
              // no vacancy
              return {
                bedKey,
                available: false,
              };
            }
            continue;
          }

          if (getMinuteDistance(nowStartTime, startTime!) < minStartDiff) {
            minStartDiff = getMinuteDistance(nowStartTime, startTime!);
          }
        }

        if (minStartDiff < durationMins + VACANCY_BUFFERED_MINS) {
          return {
            bedKey,
            available: false,
          };
        }

        return {
          bedKey,
          available: true,
          nowStartTime,
          waitTime,
        };
      }
    );

    return rightNowVacancies;
  }

  const handleChange = (minNum: number) => {
    setSelectedOption(minNum);
    setVacancies(getRightNowVacancies(minNum));
  };

  return (
    <InfoPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Giường trống ngay bây giờ"
    >
      <div>
        <form style={{ display: 'flex' }}>
          {Object.values(RIGHT_NOW_VACANCY_MINS)
            .filter((min): min is number => typeof min === 'number')
            .map((min: number) => (
              <div
                key={min}
                aria-checked={selectedOption === min}
                onClick={() => handleChange(min)}
                style={{
                  cursor: 'pointer',
                  marginLeft: '20px',
                  width: '60px',
                }}
              >
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium px-2 py-1"
                  style={{
                    backgroundColor:
                      selectedOption === min ? '#7C6AF7' : undefined,
                  }}
                >
                  {min} phút
                </Badge>
              </div>
              //   <label key={min} style={{ marginLeft: '10px' }}>
              //     <input
              //       type="radio"
              //       name="option"
              //       value={String(min)}
              //       checked={selectedOption === min}
              //       onChange={handleChange}
              //       style={{ cursor: 'pointer' }}
              //     />
              //     {`${min}p`}
              //   </label>
            ))}
        </form>
        <div>
          {vacancies?.length === 0 ? (
            <p style={{ color: 'Crimson' }}>Đang full lịch.</p>
          ) : (
            vacancies.map(({ bedKey, available, nowStartTime, waitTime }) => (
              <div key={bedKey as string} style={{ whiteSpace: 'pre-wrap' }}>
                {available && (
                  <p
                    //   style={{ whiteSpace: 'pre-line' }}
                    style={{ color: 'Chartreuse' }}
                  >
                    Giường {bedKey} trống lúc {nowStartTime}, chờ{' '}
                    <span style={{ color: 'DarkOrange' }}>{waitTime}</span>{' '}
                    phút.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* )} */}
    </InfoPopup>
  );
}

// export function NowVacancy({ bookings }: { bookings: Partial<Booking>[] }) {
//   const [isPopupOpen, setIsPopupOpen] = useState(false);

//   const [selectedOption, setSelectedOption] = useState(35);
//   const [rightNowVacancies, setRightNowVacancies] = useState<VacancyState[]>(
//     []
//   );

//   function getRightNowVacancies(
//     durationMins: number = 30,
//     waitMins: number = 20
//   ) {
//     const rightNowVacancies: VacancyState[] = Object.values(BedKey).map(
//       (bedKey) => {
//         let nowStartTime: string = format(new Date(), 'HH:mm');
//         let waitTime: number = 0;
//         let minStartDiff: number = 24 * 60;

//         const filteredBookings = bookings
//           .filter((b) => b.bedKey === bedKey)
//           .sort((a, b) => {
//             // Use a fixed reference date (e.g., today's date) for accurate comparisons
//             const baseDate = new Date().setHours(0, 0, 0, 0);

//             return compareAsc(
//               parse(a.startTime!, 'HH:mm', baseDate),
//               parse(b.startTime!, 'HH:mm', baseDate)
//             );
//           });

//         for (const { startTime, serviceId } of filteredBookings) {
//           const endTime = getEndTime(
//             startTime!,
//             SERVICES.find((s) => s.id === serviceId)!.durationMin
//           );

//           if (
//             getMinuteDistance(startTime!, nowStartTime) > 0 &&
//             getMinuteDistance(nowStartTime, endTime) > 0
//           ) {
//             waitTime =
//               getMinuteDistance(nowStartTime, endTime) + VACANCY_BUFFERED_MINS;
//             if (waitTime <= waitMins) {
//               nowStartTime = getEndTime(endTime, VACANCY_BUFFERED_MINS);
//             } else {
//               // no vacancy
//               return {
//                 bedKey,
//                 available: false,
//               };
//             }
//             continue;
//           }

//           // minStartDiff = getMinuteDistance(nowStartTime, startTime!);
//           // if (minStartDiff >= durationMins) {
//           //     if (getMinuteDistance(nowStartTime, startTime!) < minStartDiff) {
//           //         minStartDiff = getMinuteDistance(nowStartTime, startTime!);
//           //     }
//           // }
//           if (getMinuteDistance(nowStartTime, startTime!) < minStartDiff) {
//             minStartDiff = getMinuteDistance(nowStartTime, startTime!);
//           }
//         }

//         if (minStartDiff < durationMins + VACANCY_BUFFERED_MINS) {
//           return {
//             bedKey,
//             available: false,
//           };
//         }

//         return {
//           bedKey,
//           available: true,
//           nowStartTime,
//           waitTime,
//         };
//       }
//     );

//     return rightNowVacancies;
//   }

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const minNum = Number(event.target.value);
//     setSelectedOption(minNum);
//     setRightNowVacancies(getRightNowVacancies(minNum));
//   };

//   return (
//     // <main className="flex flex-col items-center justify-center min-h-screen p-24">
//     <div className="inline-flex items-center">
//       <Zap
//         color="#f59e0b"
//         size={32}
//         strokeWidth={2.5}
//         style={{ cursor: 'pointer' }}
//         onClick={() => setIsPopupOpen((prev) => !prev)}
//       />

//       <VacancyPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         vacancies={rightNowVacancies}
//         selectedOption={selectedOption}
//         handleChange={handleChange}
//       />
//     </div>
//   );
// }

export function NowVacancy({ bookings }: { bookings: Partial<Booking>[] }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    // <main className="flex flex-col items-center justify-center min-h-screen p-24">
    <div className="inline-flex items-center">
      <Zap
        color="#f59e0b"
        size={32}
        strokeWidth={2.5}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsPopupOpen((prev) => !prev)}
      />

      <VacancyPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        bookings={bookings}
        // vacancies={rightNowVacancies}
        // selectedOption={selectedOption}
        // handleChange={handleChange}
      />
    </div>
  );
}

export function Scheduler({
  staffPromise,
  bookingsPromise,
  userId,
  userRole,
  isMobile,
}: {
  staffPromise: Promise<Partial<Staff>[]>;
  bookingsPromise: Promise<Partial<Booking>[]>;
  userId: string;
  userRole: UserRole;
  isMobile: boolean;
}) {
  const staff = use(staffPromise);
  //   const todayBooking = use(bookingsPromise).map((b) => {
  //     const now = new Date();
  //     console.log('========== todayBooking now ', now);

  //     return {
  //       ...b,
  //       status: deriveStatus(b, new Date()),
  //     };
  //   });
  const todayBooking = use(bookingsPromise);

  const [date, setDate] = useState<Date>(() => getToday());
  //   const [date, setDate] = useState<Date>(getToday());
  const [bookings, setBookings] = useState<Partial<Booking>[]>(todayBooking);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [active, setActive] = useState<Partial<Booking>>(EMPTY_DRAFT);
  const [isNavigating, startNavigation] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const bookingsRef = useRef(bookings);
  const readOnly = userRole !== UserRole.ADMIN;

  useEffect(() => {
    const { supabase, channel } = runRealtimeBookings(
      date,

      // INSERT — add new block to timeline instantly
      (newBooking) => {
        setBookings((prev) => {
          // Prevent duplicate if local upsert already added it
          const exists = prev.some((b) => b.id === newBooking.id);
          return exists ? prev : [...prev, newBooking];
        });
      },

      // UPDATE — replace existing block
      (updatedBooking) => {
        setBookings((prev) =>
          prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
        );
      },

      // DELETE — remove block
      (deletedId) => {
        setBookings((prev) => prev.filter((b) => b.id !== deletedId));
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  //   Keep ref in sync with state on every render
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  // Refresh booking status automatically
  // Interval reads from ref — always current, never stale
  //   useEffect(() => {
  //     const id = setInterval(() => {
  //       const now = new Date();
  //       let hasChanged = false;

  //       const updated = bookingsRef.current.map((b) => {
  //         const derived = deriveStatus(b, now);
  //         if (b.status === derived) return b; // ← same object reference, no change
  //         hasChanged = true;
  //         return { ...b, status: derived }; // ← immutable update, new object
  //       });

  //       if (hasChanged) {
  //         setBookings(updated); // ← local state only, no server call
  //       }
  //     }, REFRESH_INTERVAL_MS);

  //   useEffect(() => {
  //     const id = setInterval(() => {
  //       const now = new Date();

  //       const updated = bookingsRef.current.map((b) => ({
  //         ...b,
  //         status: deriveStatus(b, now),
  //       }));

  //       setBookings(updated); // ← local state only, no server call
  //     }, REFRESH_INTERVAL_MS);

  //     return () => clearInterval(id);
  //   }, []);

  // Client-only status computation: runs immediately on mount, then on interval
  useEffect(() => {
    const recomputeStatuses = () => {
      //   const now = new Date('2026-07-15T08:40:52.398Z');
      const now = new Date();
      console.log('========== useEffect now ', now);

      setBookings((prev) =>
        prev.map((b) => ({ ...b, status: deriveStatus(b, now) }))
      );
    };

    recomputeStatuses(); // run once immediately — replaces the render-body new Date()
    const id = setInterval(recomputeStatuses, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  function handleDateChange(newDate: Date) {
    setDate(newDate);
    startNavigation(async () => {
      const fresh = await findBookingsByDate(newDate, userId);

      // Re-derive status on arrival so cache staleness doesn't matter
      const now = new Date();
      const withDerivedStatus = fresh.map((b) => ({
        ...b,
        status: deriveStatus(b, now), // ← override cached status with derived
      }));

      setBookings(withDerivedStatus);
    });
  }

  function handleDelete(id: string) {
    startDeleting(async () => {
      await softDeleteBookingById(id);

      setBookings((prev) => [...prev].filter((b) => b.id !== id));
    });
  }

  function setActiveBooking(b: Partial<Booking>) {
    setEditOpen(true);
    setActive(b);
  }

  function handleSaveCreate(d: Partial<Booking>) {
    startSaving(async () => {
      const offsetMins = new Date().getTimezoneOffset();
      const { id } = await upsertBooking(d, offsetMins);

      if (!compareDateString(d.date!, date)) {
        return;
      }

      setBookings((prev) => [...prev, { id, ...d }]);
    });
  }

  function handleSaveEdit(d: Partial<Booking>) {
    startSaving(async () => {
      const offsetMins = new Date().getTimezoneOffset();
      await upsertBooking(d, offsetMins);

      if (!compareDateString(d.date!, date)) {
        setBookings((prev) =>
          //   [...prev].filter((b) => compareDateString(b.date!, TODAY))
          [...prev].filter((b) => b.id !== d.id)
        );
      } else {
        const cloned = [...bookings].map((b) => (b.id === d.id ? d : b));
        setBookings(cloned);
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div
          //   className={`flex items-center gap-3 ${isNavigating ? 'opacity-60 pointer-events-none' : ''}`}
          //   className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3"
          className={cn(
            'flex items-center justify-between gap-2 sm:justify-start sm:gap-3',
            isNavigating && 'opacity-60 pointer-events-none'
          )}
        >
          {/* <button
            // onClick={() => setDate((d) => addDays(d, -1))}
            onClick={() => {
              handleDateChange(addDays(date, -1));
            }}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <ChevronLeft className="size-4" />
          </button> */}
          <div>
            <h1 className="font-semibold text-sm text-foreground capitalize">
              {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {bookings.length} lịch đặt
            </p>
          </div>
          {/* <button
            onClick={() => handleDateChange(addDays(date, 1))}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <ChevronRight className="size-4" />
          </button> */}
          <CalendarDays
            className="size-8 cursor-pointer hover:bg-grey-700"
            onClick={() => handleDateChange(addDays(date, 1))}
          />
        </div>
        {/* <div style={{ cursor: 'pointer' }}>
          <Zap color="#f59e0b" size={32} strokeWidth={2.5} />
        </div> */}
        <NowVacancy bookings={bookings} />
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          readOnly={readOnly}
        >
          <Plus className="size-4" />{' '}
          <p className="hidden md:block">Đặt lịch mới</p>
        </Button>
      </div>
      <div className="flex-1 overflow-auto pl-0.2 md:p-6">
        <BookingTimeline
          bookings={bookings}
          onBlockClick={setActiveBooking}
          isMobile={isMobile}
        />
      </div>
      <div className="md:px-5 px-2 py-2.5 border-t border-border flex flex-wrap md:gap-4 gap-2 flex-shrink-0">
        {Object.values(BookingStatus).map((s) => {
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
        })}
      </div>

      <BookingDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        bookings={bookings}
        staff={staff}
        onSave={handleSaveCreate}
        isSaving={isSaving}
        date={date}
        readOnly={readOnly}
      />
      <BookingEditDrawer
        // key={active.id ?? 'new'}
        key={`${active.id} - ${active.date}`}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={active}
        bookings={bookings}
        staff={staff}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        readOnly={readOnly}
      />
    </div>
  );
}
