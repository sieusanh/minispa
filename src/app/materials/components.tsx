'use client';
import { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/common';

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
import { Material, Durability } from '@/types';
import { INIT_MATERIALS } from '@/constants/seed';
import { durCfg } from '@/constants/config';
import { Field } from '@/components/ui/field';

export function Materials() {
  const [materials, setMaterials] = useState<Material[]>(INIT_MATERIALS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<Partial<Material>>({});
  const [delId, setDelId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', code: '', durability: 'tot', quantity: 1 });
    setDialogOpen(true);
  }
  function openEdit(m: Material) {
    setEditing(m);
    setForm({ ...m });
    setDialogOpen(true);
  }
  function handleSave() {
    if (!form.name?.trim() || !form.code?.trim()) return;
    if (editing)
      setMaterials((p) =>
        p.map((m) =>
          m.id === editing.id ? ({ ...m, ...form } as Material) : m
        )
      );
    else
      setMaterials((p) => [
        ...p,
        // { id: `m${Date.now()}`, ...form } as Material,
      ]);
    setDialogOpen(false);
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Vật liệu & Thiết bị
        </h1>
        <Button
          size="sm"
          onClick={openCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Thêm
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['Tên', 'Mã', 'Độ bền', 'Số lượng', 'Thao tác'].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      'px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider',
                      h === 'Số lượng' || h === 'Thao tác'
                        ? 'text-right'
                        : 'text-left'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materials.map((m) => {
                const d = durCfg(m.durability);
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {m.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-xs">
                      {m.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: d.bg, color: d.color }}
                      >
                        {d.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openEdit(m)}
                          className="size-7 rounded flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDelId(m.id!)}
                          className="size-7 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {materials.length === 0 && (
          <div className="py-14 text-center">
            <Package className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có vật liệu nào
            </p>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Thêm vật liệu
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Chỉnh sửa vật liệu' : 'Thêm vật liệu'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Tên">
              <Input
                value={form.name ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Khăn massage cao cấp"
              />
            </Field>
            <Field label="Mã">
              <Input
                className="font-mono"
                value={form.code ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="KM-001"
              />
            </Field>
            <Field label="Độ bền">
              <Select
                value={form.durability}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, durability: v as Durability }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tot">Tốt</SelectItem>
                  <SelectItem value="trung_binh">Trung bình</SelectItem>
                  <SelectItem value="can_thay">Cần thay</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Số lượng">
              <Input
                type="number"
                min={0}
                value={form.quantity ?? 1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
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
            <AlertDialogTitle>Xoá vật liệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setMaterials((p) => p.filter((m) => m.id !== delId));
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
