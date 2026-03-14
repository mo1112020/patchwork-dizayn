import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, Loader2 } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  variant?: 'automatic' | 'dark' | 'light';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'automatic' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const location = window.location.pathname;

  const isLanding = variant === 'dark' || (variant === 'automatic' && location === '/');

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut().then(() => {
        toast({
          title: 'Çıkış yapıldı',
          description: 'Hesabınızdan başarıyla çıkış yaptınız.',
        });
      });
    } else {
      navigate('/auth');
    }
  };

  const headerClasses = isLanding
    ? "fixed top-6 left-1/2 -translate-x-1/2 z-50 h-20 w-[95%] max-w-7xl border border-white/10 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-between px-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-500"
    : "fixed top-8 left-1/2 -translate-x-1/2 z-50 h-16 w-[95%] max-w-7xl border border-[#D1D1C7] bg-[#E8E1D9]/95 backdrop-blur-xl flex items-center justify-between px-6 rounded-2xl shadow-lg transition-all duration-300";

  const mutedTextClass = isLanding ? "text-slate-400" : "text-[#5C5C54]";
  const buttonGhostClass = isLanding
    ? "text-white hover:bg-primary/20 hover:text-primary border border-white/5"
    : "text-[#1C1C1A] hover:bg-[#D1D1C7]/50 hover:text-primary border border-[#D1D1C7]";
  const signOutClass = isLanding
    ? "text-slate-400 hover:text-white hover:bg-white/5"
    : "text-[#5C5C54] hover:text-destructive hover:bg-destructive/5";

  const textClass = isLanding ? "text-white" : "text-[#1C1C1A]";

  return (
    <header className={headerClasses}>
      {/* Logo Area */}
      <button
        type="button"
        className="flex items-center cursor-pointer group transition-transform hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg"
        onClick={() => navigate('/')}
        aria-label="PATCHWORK DIZAYN Home"
      >
        <AppLogo size="sm" showText={true} light={isLanding} />
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2 md:gap-4">
            <span className={`text-sm hidden md:inline font-medium tracking-wide ${mutedTextClass}`}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0].toUpperCase()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-xl h-10 px-4 transition-all ${buttonGhostClass}`}
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline font-semibold">Hesabım</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-xl h-10 px-4 transition-all font-medium ${signOutClass}`}
                onClick={handleAuthClick}
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-xl h-10 px-6 backdrop-blur-sm border transition-all font-bold tracking-tight ${isLanding ? 'bg-white/5 text-white border-white/10 hover:bg-primary' : 'bg-[#1C1C1A] text-white border-transparent hover:bg-primary'}`}
            onClick={handleAuthClick}
          >
            <User className="w-4 h-4 mr-2" />
            GİRİŞ YAP
          </Button>
        )}
      </div>
    </header>
  );
};
