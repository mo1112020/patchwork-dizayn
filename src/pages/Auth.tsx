import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const nameSchema = z.string().min(2);

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/designer');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        toast({ title: t('auth.loginFailed'), description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: t('auth.loginFailed'), description: String(err), variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = t('auth.emailInvalid');
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = t('auth.passwordMin');
    }

    if (!isLogin) {
      const firstNameResult = nameSchema.safeParse(firstName);
      if (!firstNameResult.success) {
        newErrors.firstName = t('auth.nameMin');
      }

      const lastNameResult = nameSchema.safeParse(lastName);
      if (!lastNameResult.success) {
        newErrors.lastName = t('auth.nameMin');
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordMismatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: t('auth.loginFailed'),
            description: error.message.includes('Invalid login credentials')
              ? t('auth.invalidCredentials')
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.welcomeBackToast'),
            description: t('auth.signedInToast'),
          });
          navigate('/designer');
        }
      } else {
        const { error } = await signUp(email, password, {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
        });

        if (error) {
          toast({
            title: t('auth.signUpFailed'),
            description: error.message.includes('User already registered')
              ? t('auth.emailExists')
              : error.message,
            variant: 'destructive',
          });
          if (error.message.includes('User already registered')) {
            setIsLogin(true);
          }
        } else {
          toast({
            title: t('auth.accountCreated'),
            description: t('auth.accountCreatedDesc'),
          });
          navigate('/designer');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setErrors({});
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[100px] pb-12 flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Dynamic theme background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse-subtle" />
        <div className="absolute bottom-[0%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-accent/15 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Auth Card */}
        <div className="bg-card/70 backdrop-blur-2xl rounded-3xl shadow-elevation-lg border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="bg-muted/30 p-8 text-center border-b border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin ? t('auth.signInDesc') : t('auth.signUpDesc')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                      {t('auth.firstName')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('auth.placeholderName')}
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                        }}
                        disabled={loading}
                        className={`pl-11 h-12 rounded-xl border-2 bg-background/50 focus:bg-background ${errors.firstName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                          } transition-colors text-foreground shadow-none`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-destructive font-medium">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                      {t('auth.lastName')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t('auth.placeholderSurname')}
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                        }}
                        disabled={loading}
                        className={`pl-11 h-12 rounded-xl border-2 bg-background/50 focus:bg-background ${errors.lastName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                          } transition-colors text-foreground shadow-none`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-destructive font-medium">{errors.lastName}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.placeholderEmail')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  disabled={loading}
                  className={`pl-11 h-12 rounded-xl border-2 bg-background/50 focus:bg-background ${errors.email ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                    } transition-colors text-foreground shadow-none`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  disabled={loading}
                  className={`pl-11 pr-11 h-12 rounded-xl border-2 bg-background/50 focus:bg-background ${errors.password ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                    } transition-colors text-foreground shadow-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive font-medium">{errors.password}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                    {t('auth.confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      disabled={loading}
                      className={`pl-11 pr-11 h-12 rounded-xl border-2 bg-background/50 focus:bg-background ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                        } transition-colors text-foreground shadow-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive font-medium">{errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.signIn') : t('auth.createAccountBtn')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">{t('auth.or') || 'veya'}</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-xl border-2 border-border bg-background/50 hover:bg-muted text-foreground font-semibold text-sm transition-all gap-3"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google {isLogin ? t('auth.signInLink') || 'ile giriş yap' : t('auth.signUp') || 'ile kayıt ol'}
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {isLogin ? (
                  <>
                    {t('auth.noAccount')}{' '}
                    <span className="text-primary font-bold hover:underline underline-offset-4">{t('auth.signUp')}</span>
                  </>
                ) : (
                  <>
                    {t('auth.hasAccount')}{' '}
                    <span className="text-primary font-bold hover:underline underline-offset-4">{t('auth.signInLink')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-muted-foreground/60 text-xs mt-6">
          {t('auth.termsNote')}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

