'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Loader2, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { debounce } from '@/lib/utils';

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggest = useCallback(
    debounce(async (q: string) => {
      setLoading(true);
      const res = await fetch(`/api/search?mode=suggest&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setTrending(data.trending ?? []);
      setLoading(false);
    }, 200),
    []
  );

  useEffect(() => {
    if (open) fetchSuggest(query);
  }, [query, open, fetchSuggest]);

  // Cmd/Ctrl+K to open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  function go(q: string) {
    if (!q.trim()) return;
    onOpenChange(false);
    router.push(`/discover?q=${encodeURIComponent(q)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-2xl translate-y-0 gap-0 p-0">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go(query)}
            placeholder="Search handcrafted treasures…"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-3">
          {query.length >= 2 && suggestions.length > 0 && (
            <div className="space-y-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => go(s)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    {s}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {(query.length < 2 || suggestions.length === 0) && (
            <div>
              <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trending
              </p>
              <div className="space-y-1">
                {trending.map((t) => (
                  <button
                    key={t}
                    onClick={() => go(t)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm capitalize transition-colors hover:bg-secondary"
                  >
                    <TrendingUp className="h-4 w-4 text-champagne-500" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
          <kbd className="rounded border border-border px-1.5 py-0.5">↵</kbd> to search
          <kbd className="rounded border border-border px-1.5 py-0.5">esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
