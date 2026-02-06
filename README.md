# AI Finance Assistant - Frontend

A modern React-based frontend application for managing personal finances with AI-powered receipt processing and expense tracking.

## 🚀 Features

- **User Authentication**: Secure login system with protected routes
- **Dashboard**: Comprehensive view of financial data and analytics
- **Receipt Upload**: AI-powered receipt scanning and data extraction
- **Expense Management**: Track and categorize expenses with intuitive tabs
- **Responsive Design**: Modern UI optimized for all devices
- **Default Currency Preference**: Users choose `default_currency` (CAD/USD/COP) on registration; the UI enforces it for receipt expenses

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **ESLint** - Code linting and quality

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository (if you haven't already)
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Development Mode

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🧹 Code Quality

Run ESLint to check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ExpensesTabs.jsx
│   ├── ProtectedRoute.jsx
│   └── ReceiptUpload.jsx
├── pages/           # Page components
│   ├── DashboardPage.jsx
│   └── LoginPage.jsx
├── lib/             # Utility functions and helpers
├── assets/          # Static assets (images, icons, etc.)
├── App.jsx          # Main application component
└── main.jsx         # Application entry point
```

## 🔐 Environment Variables

Create a `.env` file in the frontend directory if needed for API endpoints:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production (Vercel) API Proxy

This frontend uses a Vercel rewrite proxy so API calls are same-origin in production:

- Frontend calls: `/api/auth/login`, `/api/auth/me`, etc.
- Vercel proxies to the Render backend.

This avoids third-party cookie issues on mobile browsers when using HttpOnly cookies.

Files involved:
- `vercel.json` (rewrites `/api/:path*` → Render backend)
- `src/lib/api.js` (defaults `API_BASE_URL` to `/api`)

If you set `VITE_API_BASE_URL` in Vercel, make sure it does not point directly to Render; otherwise the proxy is bypassed.

## 🔐 Authentication (HttpOnly Cookie)

Authentication uses an HttpOnly cookie instead of storing tokens in `localStorage`.

- `POST /auth/login` sets `Set-Cookie: access_token=<jwt>; HttpOnly`
- The browser sends the cookie automatically on subsequent API calls.
- The frontend uses `credentials: 'include'` in `fetch`.
- `ProtectedRoute` calls `GET /auth/me` to check if the user is authenticated.

## 💱 Default currency preference

The app supports a per-user default currency (`default_currency`) configured during registration.

- **Registration**
  - The `/register` page includes a selector for `default_currency`.
  - Allowed values: `CAD`, `USD`, `COP`.

- **Persistence (frontend)**
  - After a successful login/session check, the frontend stores the user object in `localStorage` under the `user` key.
  - `ProtectedRoute` also refreshes this value by calling `GET /auth/me`.

- **Enforcement in the UI**
  - In `ReceiptUpload`, the currency column is read-only and always uses `user.default_currency`.
  - On save/confirm, expenses are submitted with `currency` forced to the user's default currency.

## 🌍 i18n (English/Spanish)

This frontend includes a lightweight i18n system (no external i18n library):

- Default language: **English** (`en`)
- Optional language: Spanish (`es`)
- Language selection is persisted in `localStorage` (`ai_finance_lang`)

Files involved:
- `src/lib/i18n.jsx` (translation dictionary + `LanguageProvider` + hooks)
- `src/main.jsx` (wraps the app with `LanguageProvider`)
- UI text uses the `useT()` hook (e.g. `t('login_title')`)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## 📄 License

This project is part of the AI Finance Assistant application.
