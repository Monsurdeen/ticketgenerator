# Techember Fest Ticket Generator

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production setup

1. Create a Supabase project and run the updated `supabase/schema.sql` in the SQL editor. This adds the Paystack reference column to existing databases.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. Create a Paystack account and add its secret key as `PAYSTACK_SECRET_KEY`. Use a test secret key for development and never expose it in browser code.
4. In the Paystack dashboard, add `https://your-domain/api/paystack/webhook` as a webhook URL. Locally, payments are verified through the Paystack callback.
5. Create a Resend account, verify a sending domain, and add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
6. Set `NEXT_PUBLIC_APP_URL` to your deployed site URL.

Paid tickets are charged in NGN. The VIP and VVIP prices are each ₦150,000; free tickets do not require a Paystack account. Supabase email magic links must allow the deployed domain in the authentication redirect URLs.





