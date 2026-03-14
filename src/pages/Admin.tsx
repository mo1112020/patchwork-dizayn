import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import { Loader2 } from 'lucide-react';

// Lazy-load heavy admin panels — each is 10k–22k lines
const AdminTextures = lazy(() => import('@/components/admin/AdminTextures').then(m => ({ default: m.AdminTextures })));
const AdminDesignerSettings = lazy(() => import('@/components/admin/AdminDesignerSettings').then(m => ({ default: m.AdminDesignerSettings })));
const AdminOrders = lazy(() => import('@/components/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminMessages = lazy(() => import('@/components/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));

function AdminPanelFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function AdminGate() {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Routes>
        <Route index element={<AdminLogin />} />
        <Route path="*" element={<AdminLogin />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<AdminPanelFallback />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="textures" replace />} />
          <Route path="textures" element={<AdminTextures />} />
          <Route path="price" element={<AdminDesignerSettings activeSection="pricing" />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="hero" element={<AdminDesignerSettings activeSection="hero" />} />
          <Route path="thread-colors" element={<AdminDesignerSettings activeSection="thread" />} />
          <Route path="email-pdf" element={<AdminDesignerSettings activeSection="email" />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function Admin() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
