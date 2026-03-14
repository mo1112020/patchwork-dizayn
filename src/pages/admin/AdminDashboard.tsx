import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminTextures } from '@/components/admin/AdminTextures';
import { AdminDesignerSettings } from '@/components/admin/AdminDesignerSettings';
import { LogOut, LayoutDashboard, Image, Settings, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('textures');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Siteye dön
            </Link>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-semibold">Admin Paneli</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2">
            <LogOut className="w-4 h-4" /> Çıkış
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="textures" className="gap-2">
              <Image className="w-4 h-4" /> Halı dokuları
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Tasarımcı ayarları
            </TabsTrigger>
          </TabsList>
          <TabsContent value="textures" className="mt-0">
            <AdminTextures />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <AdminDesignerSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
