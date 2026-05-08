import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Image,
  DollarSign,
  ImageIcon,
  Palette,
  Mail,
  MessageSquare,
  ArrowLeft,
  LogOut,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { to: '/admin/textures', icon: Image, label: 'Halı dokuları' },
  { to: '/admin/price', icon: DollarSign, label: 'Fiyat & Ölçü' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Siparişler' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Mesajlar' },
  { to: '/admin/hero', icon: ImageIcon, label: 'Hero' },
  { to: '/admin/thread-colors', icon: Palette, label: 'İp Renkleri' },
  { to: '/admin/email-pdf', icon: Mail, label: 'E-posta & PDF' },
];

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="font-semibold text-foreground">Admin</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Siteye dön
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            logout();
            navigate('/admin');
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Çıkış
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Panel</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menü</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar — fixed height, scrollable if nav overflows */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-border bg-card flex-col h-full overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main content — only this scrolls */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
