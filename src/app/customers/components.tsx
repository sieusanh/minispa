'use client';
import { useState, useMemo } from 'react';
import {
  UserCircle,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer, CustomerSource } from '@/types/customer';
import { INIT_CUSTOMERS } from '@/constants/seed';
import { sourceCfg } from '@/constants/config';
import { initials } from '@/utils/name';
import { cn } from '@/utils/common';
import { Field } from '@/components/ui/field';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
  const [tab, setTab] = useState<'all' | CustomerSource>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const matchTab = tab === 'all' || c.source === tab;
        const matchSearch =
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search);
        return matchTab && matchSearch;
      }),
    [customers, tab, search]
  );

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ ...c });
    setDialogOpen(true);
  }
  function handleSave() {
    if (editing && form.name?.trim()) {
      setCustomers((p) =>
        p.map((c) =>
          c.id === editing.id ? ({ ...c, ...form } as Customer) : c
        )
      );
    }
    setDialogOpen(false);
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">Khách hàng</h1>
        <Badge className="bg-primary/15 text-primary border-primary/20 font-mono">
          {customers.length} khách
        </Badge>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, số điện thoại..."
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="dot_xuat">Đột xuất</TabsTrigger>
            <TabsTrigger value="tiktok">Tiktok</TabsTrigger>
            <TabsTrigger value="ban_be">Bạn bè</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <UserCircle className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Không tìm thấy khách hàng
            </p>
          </div>
        )}
        {filtered.map((c) => {
          const src = sourceCfg(c.source);
          const isExp = expanded === c.id;
          return (
            <div key={c.id}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left"
                onClick={() => setExpanded(isExp ? null : c.id!)}
              >
                <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.phone.replace(/.(?=.{3})/g, '*')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    style={{ color: src.color, borderColor: `${src.color}40` }}
                  >
                    {src.label}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    🔄 {c.visitCount} lần
                  </span>
                  <ChevronRight
                    className={cn(
                      'size-4 text-muted-foreground transition-transform',
                      isExp && 'rotate-90'
                    )}
                  />
                </div>
              </button>
              {isExp && (
                <div className="px-4 pb-4 pt-2 ml-[52px] border-t border-border bg-secondary/20">
                  {c.review && (
                    <p className="text-sm italic text-muted-foreground mb-3">
                      `{c.review}`
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(c)}
                    >
                      <Edit2 className="size-3.5" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDelId(c.id!)}
                    >
                      <Trash2 className="size-3.5" />
                      Xoá
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Tên">
              <Input
                value={form.name ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Số điện thoại">
              <Input
                value={form.phone ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </Field>
            <Field label="Nguồn">
              <Select
                value={form.source}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, source: v as CustomerSource }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dot_xuat">Đột xuất</SelectItem>
                  <SelectItem value="tiktok">Tiktok</SelectItem>
                  <SelectItem value="ban_be">Bạn bè giới thiệu</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Góp ý">
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
            <AlertDialogTitle>Xoá khách hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setCustomers((p) => p.filter((c) => c.id !== delId));
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
