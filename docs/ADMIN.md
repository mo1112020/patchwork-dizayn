# Admin Dashboard

The admin panel is at **`/admin`**.

This setup works with **Supabase**. No Edge Function or CLI deploy is required—admin uses Supabase Auth and direct database/storage access.

## Login

1. **Create one admin user in Supabase** (once per project):
   - Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
   - Go to **Authentication** → **Users** → **Add user** → **Create new user**.
   - Enter an **email** (e.g. `admin@yourdomain.com`) and a **password**. Click Create.

2. **Log in to the admin panel**:
   - Go to your app’s **`/admin`** page.
   - Enter that **email** and **password**.
   - You’ll be signed in with Supabase; the app can then update settings, textures, and manage orders.

There is no default admin/admin123—you must create the user in Supabase as above.

## Order Management (New)

The admin panel now includes a dedicated **Siparişler (Orders)** tab.

1.  **View Orders**: See all rug designs submitted by customers, including their name, phone number, and full design stats (area, price).
2.  **Update Status**: Move orders through the pipeline:
    *   **Fiyat Bekleniyor (Pending)**: Initial state when a client requests a price.
    *   **Hazırlanıyor (In Progress)**: Rug is being manufactured.
    *   **Halınız Hazır! (Ready)**: Production complete.
    *   **Teslim Edildi (Delivered)**: Order finished.
3.  **Takip Numarası**: Enter the kargo/tracking number so the customer can track their shipment from their profile.
4.  **Admin Note**: Add a note that will be visible to the customer on their profile page (e.g., "Your payment was received, we started production").

## Saving Data (Settings & Textures)

Updates go **directly to Supabase** from the browser (tables `designer_settings`, `rug_textures`, and the `rug-textures` storage bucket). Row Level Security (RLS) allows any **authenticated** user to perform these writes, so the admin user you created is enough.

## Database and Storage

Ensure migrations have been applied so the tables and bucket exist. If you see **"Could not find the table 'public.rug_textures'"**:

- **Migrations:** Run them from the Supabase Dashboard: **SQL Editor** → run the SQL from:
  - `supabase/migrations/20260211000000_rug_textures_and_storage.sql`
  - `supabase/migrations/20260212000000_designer_settings.sql`
- **Manual Adjustments:** To enable order tracking, run this SQL:
```sql
ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
```

Create the **rug-textures** storage bucket if it’s missing: **Storage** → **New bucket** → name: `rug-textures`, set to **Public**.

## Summary

| Step | Action |
|------|--------|
| 1 | Create one user in Supabase (Authentication → Users → Add user). |
| 2 | Open your app → `/admin` → log in with that email and password. |
| 3 | Use **Siparişler** tab to manage customer requests and tracking numbers. |
| 4 | Use **Tasarım Ayarları** to edit global pricing and textures. |

No complex CLI required—all updates sync in real-time between the admin and the customer profile.
