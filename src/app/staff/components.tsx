'use client';
import { useState, use } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Save,
  BarChart2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { SERVICES } from '@/constants/config';
// import { Staff } from '@/types';
import { type Staff } from '@/types';
import { initials } from '@/utils/name';
import { formatPrice } from '@/utils/price';
import { format } from 'date-fns';
import { cn } from '@//utils/common';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { upsertStaff, softDeleteStaffById } from '@/lib/data/staff';

export function Staff({ staff }: { staff: Promise<Staff[]> }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [form, setForm] = useState<Partial<Staff>>({});
  const [delId, setDelId] = useState<string | null>(null);
  const allStaff = use(staff);

  function openCreate() {
    setEditing(false);
    setForm({
      name: '',
      phone: '',
      revenueShareRate: 40,
      currentMonthRevenue: 0,
      zaloId: '',
      review: '',
    });
    setDialogOpen(true);
  }
  function openEdit(s: Staff) {
    setEditing(true);
    setForm({ ...s });
    setDialogOpen(true);
  }
  function handleSave() {
    if (!form.name?.trim()) return;
    // if (editing)
    //   setStaff((p) =>
    //     p.map((s) => (s.id === editing.id ? ({ ...s, ...form } as Staff) : s))
    //   );
    // else
    //   setStaff((p) => [
    //     ...p,
    //     // { id: `s${Date.now()}`, currentMonthRevenue: 0, ...form } as Staff,
    //   ]);
    upsertStaff(form);
    setDialogOpen(false);
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Nhân viên</h1>
        <Button
          size="sm"
          onClick={openCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Thêm nhân viên
        </Button>
      </div>

      {allStaff.length === 0 ? (
        <div className="text-center py-20">
          <Users className="size-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Chưa có nhân viên nào</p>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm nhân viên đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStaff.map((s) => {
            const comm = Math.round(
              (s.currentMonthRevenue * s.revenueShareRate) / 100
            );
            return (
              <div
                key={s.id}
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                      {initials(s.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="size-3" />
                        {s.phone}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/15 text-primary border-primary/20">
                    {s.revenueShareRate}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Doanh thu tháng
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {s.currentMonthRevenue.toLocaleString()}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Hoa hồng tháng
                    </span>
                    <span className="font-mono font-medium text-primary">
                      {comm.toLocaleString()}K
                    </span>
                  </div>
                </div>

                {s.review && (
                  <p className="text-xs italic text-muted-foreground line-clamp-2 border-t border-border pt-3">
                    `{s.review}`
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(s)}
                  >
                    <Edit2 className="size-3.5" /> Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDelId(s.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Tên">
              <Input
                value={form.name ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nguyễn Thị Lan"
              />
            </Field>
            <Field label="Số điện thoại">
              <Input
                value={form.phone ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="0901 234 567"
              />
            </Field>
            <Field label="Tỉ lệ hoa hồng (%)">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.revenueShareRate ?? 40}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    revenueShareRate: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Zalo ID">
              <Input
                value={form.zaloId ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zaloId: e.target.value }))
                }
                placeholder="ten.zalo"
              />
            </Field>
            <Field label="Góp ý / Nhận xét">
              <textarea
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                rows={2}
                value={form.review ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, review: e.target.value }))
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={() => setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                softDeleteStaffById(delId!);
                setDelId(null);
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// const TECH_STAFF_ID = 's1';

// // ─── SCREEN 6: TECH REVENUE ───────────────────────────────────────────────────

// export function TechRevenuePage() {
//   const me = INIT_STAFF.find((s) => s.id === TECH_STAFF_ID)!;
//   const [month, setMonth] = useState('5');
//   const [year, setYear] = useState('2026');
//   const myDone = INIT_BOOKINGS.filter(
//     (b) => b.staffId === TECH_STAFF_ID && b.status === 'done'
//   );
//   const comm = Math.round((me.currentMonthRevenue * me.revenueShareRate) / 100);

//   return (
//     <div className="p-5 md:p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-xl font-semibold text-foreground">Doanh thu</h1>
//         <div className="flex items-center gap-2">
//           <Select value={month} onValueChange={setMonth}>
//             <SelectTrigger className="w-[110px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {Array.from({ length: 12 }, (_, i) => (
//                 <SelectItem key={i} value={String(i)}>
//                   Tháng {i + 1}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Select value={year} onValueChange={setYear}>
//             <SelectTrigger className="w-[90px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {['2024', '2025', '2026'].map((y) => (
//                 <SelectItem key={y} value={y}>
//                   {y}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//         <div className="rounded-xl border border-border bg-card p-5">
//           <p className="text-sm text-muted-foreground mb-3">Tỉ lệ hoa hồng</p>
//           <p className="text-4xl font-semibold tracking-tight text-primary">
//             {me.revenueShareRate}%
//           </p>
//         </div>
//         <div className="rounded-xl border border-border bg-card p-5">
//           <div className="flex items-center justify-between mb-3">
//             <p className="text-sm text-muted-foreground">Doanh thu tháng</p>
//             <TrendingUp className="size-4 text-green-400" />
//           </div>
//           <p className="text-4xl font-semibold font-mono tracking-tight text-foreground">
//             {me.currentMonthRevenue.toLocaleString()}K
//           </p>
//         </div>
//         <div className="rounded-xl border border-border bg-card p-5">
//           <div className="flex items-center justify-between mb-3">
//             <p className="text-sm text-muted-foreground">Hoa hồng tháng</p>
//             <Wallet className="size-4 text-primary" />
//           </div>
//           <p className="text-4xl font-semibold font-mono tracking-tight text-primary">
//             {comm.toLocaleString()}K
//           </p>
//         </div>
//       </div>

//       <div className="rounded-xl border border-border bg-card overflow-hidden">
//         <div className="px-4 py-3 border-b border-border">
//           <h2 className="text-sm font-medium text-foreground">
//             Lịch hoàn thành — Tháng {Number(month) + 1}/{year}
//           </h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-border bg-secondary/50">
//                 {['Ngày', 'Khách hàng', 'Dịch vụ', 'Giá', 'Hoa hồng'].map(
//                   (h, i) => (
//                     <th
//                       key={h}
//                       className={cn(
//                         'px-4 py-3 text-xs font-medium text-muted-foreground uppercase',
//                         i >= 3 ? 'text-right' : 'text-left'
//                       )}
//                     >
//                       {h}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-border">
//               {myDone.map((b) => {
//                 const svc = SERVICES.find((s) => s.key === b.serviceId);
//                 const c = svc
//                   ? Math.round((svc.priceVnd * me.revenueShareRate) / 100)
//                   : 0;
//                 return (
//                   <tr
//                     key={b.id}
//                     className="hover:bg-secondary/30 transition-colors"
//                   >
//                     <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
//                       {format(b.date, 'dd/MM')}
//                     </td>
//                     <td className="px-4 py-3 text-foreground">
//                       {b.customerName}
//                     </td>
//                     <td className="px-4 py-3 text-muted-foreground">
//                       {svc?.nameVi}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono text-foreground">
//                       {svc ? formatPrice(svc.priceVnd) : '—'}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono text-primary">
//                       {c}K
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             {myDone.length > 0 && (
//               <tfoot>
//                 <tr className="border-t-2 border-border bg-secondary/50">
//                   <td
//                     colSpan={3}
//                     className="px-4 py-3 text-sm font-semibold text-foreground text-right"
//                   >
//                     Tổng cộng
//                   </td>
//                   <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
//                     {myDone.reduce(
//                       (s, b) =>
//                         s +
//                         (SERVICES.find((sv) => sv.key === b.serviceId)
//                           ?.priceVnd ?? 0),
//                       0
//                     )}
//                     K
//                   </td>
//                   <td className="px-4 py-3 text-right font-mono font-semibold text-primary">
//                     {myDone.reduce(
//                       (s, b) =>
//                         s +
//                         Math.round(
//                           ((SERVICES.find((sv) => sv.key === b.serviceId)
//                             ?.priceVnd ?? 0) *
//                             me.revenueShareRate) /
//                             100
//                         ),
//                       0
//                     )}
//                     K
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>
//         {myDone.length === 0 && (
//           <div className="py-12 text-center">
//             <BarChart2 className="size-10 text-muted-foreground mx-auto mb-3" />
//             <p className="text-sm text-muted-foreground">
//               Chưa có lịch hoàn thành trong tháng này
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
