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

### Environment Setup

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in `.env`:
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NPM_TOKEN`: GitHub personal access token for private packages (required for `@salvadorsc/quinipolo-shared`)

3. **GitHub NPM Token Setup** (Required):

   The project uses a private GitHub package (`@salvadorsc/quinipolo-shared`). You need to create a GitHub Personal Access Token:

   a. Go to [GitHub → Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
   b. Click "Generate new token (classic)"
   c. Give it a name (e.g., "Quinipolo NPM")
   d. Select the `read:packages` scope
   e. Generate and copy the token
   f. Add it to your `.env` file as `NPM_TOKEN=your_token_here`

   Or add it to your shell profile:

   ```bash
   echo 'export NPM_TOKEN=your_github_token_here' >> ~/.zshrc
   source ~/.zshrc
   ```

### Installation

**Important**: The project requires TypeScript 4.9.5 (compatible with react-scripts 5.0.1).

```bash
npm install
```

If you encounter peer dependency issues, you can use:

```bash
npm install --legacy-peer-deps
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
