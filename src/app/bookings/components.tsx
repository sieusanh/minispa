'use client';

import { useState, useEffect, useTransition, use, useRef } from 'react';
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
import { EMPTY_DRAFT, SERVICES, ADMIN, statusCfg } from '@/constants/config';
import { TIMELINE_START_MIN, TIMELINE_TOTAL_MIN } from '@/constants/time';
import {
  checkConflict,
  TIME_SLOTS,
  timeToMin,
  HOUR_MARKS,
  convertTimeToPM,
  addMinutesToTime,
  compareDateString,
} from '@/utils/time';
import { formatPrice } from '@/utils/price';
import { Booking, BookingStatus, Staff, BedKey } from '@/types';
import { cn } from '@/utils/common';
import { deriveStatus } from '@/utils/bookings';
import { TODAY, REFRESH_INTERVAL_MS } from '@/constants/config';
import { ChevronLeft, ChevronRight, Plus, LoaderCircle } from 'lucide-react';
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
        <p
          className="text-[10px] truncate font-medium"
          style={{ color: cfg.color }}
        >
          {convertTimeToPM(booking.startTime!)} -{' '}
          {convertTimeToPM(
            addMinutesToTime(booking.startTime!, svc.durationMin)
          )}
        </p>
        <p
          className="text-[10px] truncate font-medium"
          style={{ color: cfg.color }}
        >
          {booking.staffName}
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
          {Object.values(BedKey).map((bed) => (
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
                    .filter((b) => b.bedKey === bed)
                    .map((b) => {
                      return (
                        <BookingBlock
                          //   key={b.id}
                          key={b.id ?? `${b.bedKey}-${b.startTime}-${b.date}`}
                          booking={b}
                          onClick={() => onBlockClick?.(b)}
                          readOnly={readOnly}
                        />
                      );
                    })}
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
  bookings,
  staff,
  onSave,
  isSaving,
  date,
}: {
  open: boolean;
  onClose: () => void;
  bookings: Partial<Booking>[];
  staff: Partial<Staff>[];
  onSave: (d: Partial<Booking>) => void;
  isSaving: boolean;
  date: Date;
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
    if (!form.phone!.trim() || form.phone!.replace(/\D/g, '').length < 9)
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
    // onClose();
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
                placeholder=""
              />
            </Field>

            <Field label="Dịch vụ *" error={errs.serviceId}>
              <Select
                value={form.serviceId}
                onValueChange={(v) => {
                  upd('serviceId', v);
                  const price = SERVICES.find((s) => s.id === v)!.priceVnd;
                  upd('price', price);
                }}
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

            <DatePickerField
              label="Ngày *"
              value={form.date || date}
              onChange={(d) => upd('date', d || date)}
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
                      {s.name} ({s.revenueShareRate}%)
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
              />
            </Field>
          </div>

          <SheetFooter className="px-5 py-4 border-t border-border flex-row items-center gap-2">
            {/* <Button variant="outline" size="sm" onClick={onClose}> */}
            <Button variant="outline" size="sm" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
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
}) {
  const [form, setForm] = useState<Partial<Booking>>(
    open ? booking : EMPTY_DRAFT
  );
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
    if (!form.phone!.trim() || form.phone!.replace(/\D/g, '').length < 9)
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
    // onClose();
    handleClose();
  }

  function handleDelete(id: string) {
    onDelete(id);
    setDelOpen(false);
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
                onValueChange={(v) => {
                  upd('serviceId', v);
                  const price = SERVICES.find((s) => s.id === v)!.priceVnd;
                  upd('price', price);
                }}
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

            <DatePickerField
              label="Ngày *"
              value={form.date!}
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
                    <SelectItem key={s.id} value={s.id!}>
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
                  <SelectItem value={BookingStatus.OPEN}>Mở</SelectItem>
                  <SelectItem value={BookingStatus.UPCOMING}>
                    Sắp tới
                  </SelectItem>
                  <SelectItem value={BookingStatus.IN_PROGRESS}>
                    Đang làm
                  </SelectItem>
                  <SelectItem value={BookingStatus.DONE}>Xong</SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>Huỷ</SelectItem>
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
            >
              <Trash2 className="size-3.5" /> Xoá
            </Button>

            {/* <Button variant="outline" size="sm" onClick={onClose}> */}
            <Button variant="outline" size="sm" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
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

export function Scheduler({
  staffPromise,
  bookingsPromise,
}: {
  staffPromise: Promise<Partial<Staff>[]>;
  bookingsPromise: Promise<Partial<Booking>[]>;
}) {
  const staff = use(staffPromise);
  const todayBooking = use(bookingsPromise);

  const [date, setDate] = useState<Date>(TODAY);
  const [bookings, setBookings] = useState<Partial<Booking>[]>(todayBooking);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [active, setActive] = useState<Partial<Booking>>(EMPTY_DRAFT);
  const [isNavigating, startNavigation] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const bookingsRef = useRef(bookings);

  //   Keep ref in sync with state on every render
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  // Refresh booking status automatically
  // Interval reads from ref — always current, never stale
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      let isChanged: boolean = false;
      const freshBookings = bookingsRef.current.map((b) => ({ ...b })); // clone
      for (const b of freshBookings) {
        const derived = deriveStatus(b, now);
        if (b.status !== derived) {
          b.status = derived;
          isChanged = true;
        }
      }
      if (isChanged) {
        startSaving(async () => {
          await bulkUpdateBooking(freshBookings);
          setBookings(freshBookings);
        });
      }
      //   setBookings(freshBookings);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id); // cleanup on unmount
  }, []);

  function handleDateChange(newDate: Date) {
    setDate(newDate);
    startNavigation(async () => {
      const fresh = await findBookingsByDate(newDate);
      setBookings(fresh);
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
      await upsertBooking(d, offsetMins);
      if (!compareDateString(d.date!, date)) {
        return;
      }

      setBookings((prev) => [...prev, d]);
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
          className={`flex items-center gap-3 ${isNavigating ? 'opacity-60 pointer-events-none' : ''}`}
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
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Đặt lịch mới
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <BookingTimeline bookings={bookings} onBlockClick={setActiveBooking} />
      </div>
      <div className="px-5 py-2.5 border-t border-border flex flex-wrap gap-4 flex-shrink-0">
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
      />
      <BookingEditDrawer
        // key={active.id ?? 'new'}
        key={`${active.id} - ${new Date().getTime()}`}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={active}
        bookings={bookings}
        staff={staff}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
