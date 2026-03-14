# Email Notification Setup for Rug Weaver Pro

This guide explains how to set up automatic email notifications when users generate PDF designs.

## Prerequisites

1. **Supabase Project** - You need a Supabase project
2. **Resend Account** - Sign up at [resend.com](https://resend.com) (free tier available)

## Setup Instructions

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use their test domain for development)
3. Go to **API Keys** section
4. Create a new API key and copy it

### Step 2: Deploy the Edge Function

1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Set the Resend API key as a secret:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key_here
   ```

5. Deploy the function:
   ```bash
   supabase functions deploy send-design-email
   ```

### Step 3: Configure Email Domain (Production)

For production, you need to verify your domain in Resend:

1. Go to Resend dashboard → **Domains**
2. Add your domain (e.g., `halizx.pro`)
3. Add the DNS records they provide to your domain
4. Wait for verification

Then update the Edge Function to use your domain:
- Change `from: 'Halizx Rug Weaver <noreply@halizx.pro>'` to your verified domain

### Step 4: Test the Setup

1. Run your app locally
2. Create a design in the Designer
3. Click "Generate Spec Export"
4. Check the email at `ma6118923@gmail.com`

## How It Works

When a user clicks "Generate Spec Export":

1. **PDF is generated** locally in the browser
2. **PDF is saved** to the user's computer
3. **PDF is converted** to base64
4. **Email is sent** via Supabase Edge Function to `ma6118923@gmail.com`
5. **Email includes**:
   - Design details (name, dimensions, price, etc.)
   - User information (name, email)
   - PDF attachment

## Email Content

The email includes:
- Design name
- Dimensions (width × height)
- Total area
- Estimated price
- Number of patches
- Client name (if provided)
- Reference number (if provided)
- User who submitted it
- Submission date/time
- **PDF attachment** with full specification

## Troubleshooting

### Email not received?

1. Check Supabase logs:
   ```bash
   supabase functions logs send-design-email
   ```

2. Verify the secret is set:
   ```bash
   supabase secrets list
   ```

3. Check spam folder

### Function deployment fails?

- Make sure you're linked to the correct project
- Ensure you have the latest Supabase CLI
- Check that the function code is in `supabase/functions/send-design-email/index.ts`

### Want to change the recipient email?

Edit `supabase/functions/send-design-email/index.ts`:
```typescript
const ADMIN_EMAIL = 'your-new-email@example.com'
```

Then redeploy:
```bash
supabase functions deploy send-design-email
```

## Cost

- **Resend Free Tier**: 100 emails/day, 3,000 emails/month
- **Supabase Edge Functions**: First 500K invocations free/month

For most use cases, this will be completely free!

## Security Notes

- The API key is stored securely in Supabase secrets
- Emails are sent server-side (not exposed to client)
- User can still download PDF even if email fails
- Email sending is non-blocking (won't affect user experience)
