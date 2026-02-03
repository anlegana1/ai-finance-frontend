# AI Finance Assistant - Frontend

A modern React-based frontend application for managing personal finances with AI-powered receipt processing and expense tracking.

## 🚀 Features

- **User Authentication**: Secure login system with protected routes
- **Dashboard**: Comprehensive view of financial data and analytics
- **Receipt Upload**: AI-powered receipt scanning and data extraction
- **Expense Management**: Track and categorize expenses with intuitive tabs
- **Responsive Design**: Modern UI optimized for all devices

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
VITE_API_URL=your_backend_api_url
```

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
