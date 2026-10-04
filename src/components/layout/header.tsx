'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, User, Heart, LayoutDashboard } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn, initials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { SearchCommand } from '@/components/commerce/search-command';
import { useCartUi } from '@/store/cart-store';
import { Magnetic } from '@/components/motion/magnetic';

const NAV = [
  { href: '/discover', label: 'Discover' },
  { href: '/stores', label: 'Artisans' },
  { href: '/campaigns/diwali', label: 'Collections' },
  { href: '/sell', label: 'Sell on Karu' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const { count } = useCartUi();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const role = session?.user?.role;

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'glass border-b border-border/60 py-3' : 'py-5'
        )}
      >
        <nav className="container-wide flex items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-1" aria-label="Karu home">
            <span className="font-display text-2xl font-bold tracking-tight">Karu</span>
            <span className="text-champagne-500 transition-transform group-hover:rotate-90">·</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link href="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[10px] font-bold text-graphite-950">
                    {count}
                  </span>
                )}
              </Button>
            </Link>

            {session ? (
              <div className="group relative">
                <Avatar className="h-9 w-9 cursor-pointer border border-border">
                  {session.user.image && <AvatarImage src={session.user.image} alt="" />}
                  <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
                </Avatar>
                <div className="invisible absolute right-0 top-full w-52 translate-y-2 rounded-xl border border-border/70 bg-card p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                  <MenuLink href="/account" icon={<User className="h-4 w-4" />}>Account</MenuLink>
                  <MenuLink href="/account/orders" icon={<ShoppingBag className="h-4 w-4" />}>Orders</MenuLink>
                  {(role === 'SELLER' || role === 'BUSINESS_SELLER') && (
                    <MenuLink href="/seller" icon={<LayoutDashboard className="h-4 w-4" />}>Seller Studio</MenuLink>
                  )}
                  {(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR') && (
                    <MenuLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Admin</MenuLink>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <Magnetic strength={0.2}>
                  <Link href="/sign-in">
                    <Button variant="gold" size="sm">Sign in</Button>
                  </Link>
                </Magnetic>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 glass pt-24 lg:hidden"
          >
            <div className="container-wide flex flex-col gap-2">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-border/40 py-4 font-display text-2xl"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {!session && (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="mt-4">
                  <Button variant="gold" className="w-full">Sign in</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
    >
      {icon}
      {children}
    </Link>
  );
}
