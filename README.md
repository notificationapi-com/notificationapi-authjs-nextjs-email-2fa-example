# Next.js and Auth.js Email/Password Authentication with 2FA Example

This example demonstrates how to implement email/password authentication with two-factor authentication (2FA) using Next.js and Auth.js. The 2FA codes are delivered via email using [NotificationAPI](https://www.notificationapi.com).

## Features

- ✨ Email/Password authentication
- 🔒 Two-factor authentication (2FA) via email
- 📧 Email delivery using NotificationAPI
- 🗄️ Persistent sessions with Prisma
- 🔐 Secure password hashing with bcrypt
- 🎨 Clean and modern UI with Tailwind CSS

## How It Works

1. User enters email and password
2. If credentials are valid, a 6-digit 2FA code is generated and sent via email
3. User enters the 2FA code to complete authentication
4. 2FA codes expire after 10 minutes for security

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/notificationapi-com/notificationapi-authjs-nextjs-email-otp-example
   cd notificationapi-authjs-nextjs-email-otp-example
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables in `.env`:

   ```env
   # Auth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=[your-secret]

   # NotificationAPI credentials
   NOTIFICATIONAPI_CLIENT_ID=[your-client-id]
   NOTIFICATIONAPI_CLIENT_SECRET=[your-client-secret]
   ```

4. Set up your database:

   ```bash
   npx prisma db push
   ```

5. Configure NotificationAPI:

   - Create an account at [NotificationAPI](https://app.notificationapi.com)
   - Create a "2fa_code" template with the following merge tag:
     - `{{code}}`: The 2FA verification code

6. Run the development server:
   ```bash
   npm run dev
   ```

## Key Files

- `app/api/auth/[...nextauth]/route.ts`: Auth.js configuration with 2FA implementation
- `app/auth/signin/page.tsx`: Sign-in page
- `app/auth/verify-2fa/page.tsx`: 2FA verification page
- `prisma/schema.prisma`: Database schema with 2FA fields

## Learn More

- [Auth.js Documentation](https://authjs.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [NotificationAPI Documentation](https://docs.notificationapi.com)

## License

MIT
