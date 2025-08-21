# Quinipolo Frontend

This is the frontend application for Quinipolo, a sports prediction platform.

## Features

### Authentication

- User registration and login
- Google OAuth integration
- **Password Reset Flow** - Complete password reset functionality with email verification

### Password Reset Flow

The password reset flow includes:

1. **Request Reset**: Users can request a password reset from the login page
2. **Email Verification**: Reset emails are sent with secure tokens
3. **Reset Page**: Dedicated page for setting new passwords
4. **Environment Awareness**: Automatically detects development vs production environments
5. **Security**: Includes cooldown timers and proper session management

#### How it works:

1. User clicks "Forgot Password?" on login page
2. System sends reset email with secure link
3. User clicks link in email (redirects to `/reset-password`)
4. User enters new password and confirms
5. System updates password and redirects to login

#### Environment Configuration:

- **Development**: Uses `http://localhost:3001` for redirects
- **Production**: Uses `window.location.origin` for redirects

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:3000
```

### Running the Application

```bash
npm start
```

The application will be available at `http://localhost:3001`.

## Available Scripts

- `npm start` - Start the development server
- `npm build` - Build the application for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (not recommended)

## Project Structure

```
src/
├── Components/          # Reusable UI components
├── Context/            # React context providers
├── lib/                # External library configurations
├── Routes/             # Page components
│   ├── LoginForm/      # Login and password reset
│   ├── ResetPassword/  # Password reset page
│   └── ...
├── utils/              # Utility functions
└── locales/            # Internationalization files
```

## Technologies Used

- React 18
- TypeScript
- Ant Design (UI components)
- Material-UI
- React Router
- Supabase (Authentication & Database)
- i18next (Internationalization)
