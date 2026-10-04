'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { createProductAction } from '@/server/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUiSound } from '@/components/audio/audio-controller';

export function ProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const playSound = useUiSound();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    materials: '',
    origin: '',
    stock: '10',
    tags: '',
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function generateDescription() {
    if (!form.title) {
      setError('Add a title first so the assistant has context.');
      return;
    }
    setAiBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateDescription',
          payload: { title: form.title, materials: form.materials, origin: form.origin },
        }),
      });
      const data = await res.json();
      if (data?.result) set('description', data.result);
    } catch {
      setError('The assistant is unavailable right now.');
    } finally {
      setAiBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createProductAction({
        title: form.title,
        description: form.description,
        price: Math.round(Number(form.price) * 100),
        compareAtPrice: form.compareAtPrice ? Math.round(Number(form.compareAtPrice) * 100) : undefined,
        categoryId: form.categoryId || undefined,
        materials: form.materials || undefined,
        origin: form.origin || undefined,
        stock: Number(form.stock) || 0,
        tags: form.tags || undefined,
        leadTimeDays: 3,
        customizable: false,
        bulkAvailable: false,
      });
      if (res.ok) {
        playSound('success');
        router.push('/seller/products');
        router.refresh();
      } else {
        setError(res.error ?? 'Could not create product.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Title</label>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Hand-thrown terracotta serving bowl"
          required
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Description</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateDescription}
            disabled={aiBusy}
          >
            {aiBusy ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            AI assist
          </Button>
        </div>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Tell the story behind this piece…"
          rows={5}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Price (₹)</label>
          <Input
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="1499"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Compare-at price (₹)</label>
          <Input
            type="number"
            min="1"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) => set('compareAtPrice', e.target.value)}
            placeholder="1999"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Stock</label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Materials</label>
          <Input
            value={form.materials}
            onChange={(e) => set('materials', e.target.value)}
            placeholder="Terracotta clay, food-safe glaze"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Origin</label>
          <Input
            value={form.origin}
            onChange={(e) => set('origin', e.target.value)}
            placeholder="Jaipur, Rajasthan"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Tags (comma separated, optional)</label>
        <Input
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="Leave empty to auto-tag with AI"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} size="lg">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish product
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
