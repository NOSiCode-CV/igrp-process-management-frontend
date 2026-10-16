# IGRP Framework Next.js Template

A production-ready template for building applications with the IGRP Framework on Next.js 15. This template provides a complete foundation with authentication, layout management, and a modern UI built on top of the IGRP design system.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How It's Built](#how-its-built)
- [Authentication](#authentication)
- [Preview Mode](#preview-mode)
- [Docker Support](#docker-support)

## 🎯 Overview

The IGRP Framework Next.js Template is a comprehensive starter template that includes:

- **Next.js 15** with App Router and Turbopack
- **IGRP Framework** integration with layout management
- **NextAuth.js** for authentication
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** with Zod validation
- **Biome** for code formatting and linting
- **[Lucide](https://lucide.dev/icons/)** for icon library
- **Modern UI Components** from IGRP Design System

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 22.x.x
- **pnpm** (recommended) or npm/yarn
- **Git**

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Application Configuration
IGRP_APP_CODE=your-app-code
IGRP_PREVIEW_MODE=false
NEXT_PUBLIC_BASE_PATH=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# API Configuration
IGRP_ACCESS_MANAGEMENT_API=https://your-api-url.com
NEXT_PUBLIC_IGRP_APP_HOME_SLUG=/
NEXT_IGRP_APP_CENTER_URL=https://app-center-url.com

# Image Domains (comma-separated)
NEXT_PUBLIC_ALLOWED_DOMAINS=example.com,cdn.example.com
```

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
templates/demo/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes (login, logout)
│   │   ├── (igrp)/            # IGRP-protected routes
│   │   │   ├── layout.tsx    # IGRP layout wrapper
│   │   │   └── page.tsx      # Home page
│   │   ├── api/               # API routes
│   │   │   └── auth/         # NextAuth API routes
│   │   └── layout.tsx        # Root layout
│   ├── actions/               # Server actions
│   │   └── igrp/             # IGRP-specific actions
│   ├── config/               # Configuration files
│   │   ├── login.ts         # Login configuration
│   │   └── site.ts          # Site metadata
│   ├── lib/                  # Utility libraries
│   │   ├── auth-helpers.ts  # Authentication helpers
│   │   ├── auth-options.ts  # NextAuth configuration
│   │   └── fonts.ts         # Font configuration
│   ├── temp/                 # Mock data (for preview mode)
│   │   ├── applications/    # Mock applications
│   │   ├── menus/           # Mock menu items
│   │   └── users/           # Mock user data
│   ├── styles/               # Global styles
│   ├── middleware.ts         # Next.js middleware
│   └── igrp.template.config.ts  # IGRP configuration builder
├── public/                    # Static assets
├── create-template/          # Template publishing scripts
├── docker/                   # Docker configuration
└── package.json
```

## ⚙️ Configuration

### IGRP Configuration

The main IGRP configuration is built in `src/igrp.template.config.ts`. This file:

- Configures the IGRP layout (header, sidebar, menus)
- Sets up authentication and session management
- Defines preview mode behavior
- Configures API management client

### Layout Configuration

The layout is configured in `src/app/(igrp)/layout.tsx`:

- Wraps routes with IGRP layout components
- Handles authentication redirects
- Manages session state
- Configures preview mode

### Site Customization

Coming soon

### Login Customization

Coming soon

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `IGRP_APP_CODE` | Your application code identifier | `my-app` |
| `NEXTAUTH_URL` | Public URL of your application | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth encryption | Generate with `openssl rand -base64 32` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `IGRP_PREVIEW_MODE` | Enable preview mode (no auth required) | `false` |
| `IGRP_ACCESS_MANAGEMENT_API` | API Management base URL | - |
| `NEXT_PUBLIC_BASE_PATH` | Base path for the application | `/` |
| `NEXT_PUBLIC_IGRP_APP_HOME_SLUG` | Default home route | `/` |
| `NEXT_IGRP_APP_CENTER_URL` | Application center URL | - |
| `NEXT_PUBLIC_ALLOWED_DOMAINS` | Allowed image domains (comma-separated) | - |
| `IGRP_SYNC_ON_CODE_MENUS` | Enable synchronization of menus defined in code with the IGRP system | `false` |
| `IGRP_SYNC_ACCESS` | Enable synchronization of applications, resources, and menus with the IGRP Access Management API | `true` |
| `IGRP_M2M_SERVICE_ID` | Unique identifier for your service in the IGRP Access Management system (required when `IGRP_SYNC_ACCESS=true`) | - |
| `IGRP_M2M_TOKEN` | Authentication token for machine-to-machine API calls (required when `IGRP_SYNC_ACCESS=true`) | - |
| `IGRP_PROCESS_EXECUTION_URL` | Base URL of the process-execution app (where task / consultation routes live) | `https://apps.example.com/apps/core` |

### Process Execution Variables

#### `IGRP_PROCESS_EXECUTION_URL`
- **Purpose**: Base URL used to build task execution and process consultation links (`buildTaskExecutionUrl`, `buildProcessInstanceUrl`)
- **Usage**: Full origin + app slug of the app that hosts `/process/...` (e.g. the Core app). When set, it overrides the Access Management lookup by `applicationBase`
- **When empty**: The app resolves the target from Access Management (`getApplication(applicationBase)` → `slug` / `url`), so cluster routes keep the correct `/apps/<slug>` prefix
- **Cluster note**: Prefer leaving this empty in multi-app clusters so each process opens in its owning app. Set it only when all processes run in a single fixed execution app
- **Example (cluster, fixed Core app)**: `https://apps.example.com/apps/core`

### Synchronization Variables

The following variables control how your application synchronizes with the IGRP system:

#### `IGRP_SYNC_ON_CODE_MENUS`
- **Purpose**: Controls whether menus defined in your application code are synchronized with the IGRP system
- **Usage**: Set to `true` to enable code-based menu synchronization, `false` to disable
- **When to use**: Enable this if you want to sync menus that are hardcoded in your application with the IGRP framework

#### `IGRP_SYNC_ACCESS`
- **Purpose**: Controls synchronization of applications, resources, and menus with the IGRP Access Management API
- **Usage**: Set to `true` to enable access management synchronization, `false` to disable
- **When to use**: Enable this if you want your application to automatically sync its structure (applications, resources, menus) with the IGRP Access Management system
- **Note**: Requires `IGRP_M2M_SERVICE_ID` and `IGRP_M2M_TOKEN` to be configured when enabled

#### `IGRP_M2M_SERVICE_ID`
- **Purpose**: Unique identifier for your service in the IGRP Access Management system
- **Usage**: Set this to your service identifier (e.g., `demo-igrp` or `your-service-name`)
- **Required when**: `IGRP_SYNC_ACCESS=true`
- **How to get**: Contact your IGRP Access Management administrator

#### `IGRP_M2M_TOKEN`
- **Purpose**: Authentication token used for machine-to-machine API calls to the IGRP Access Management API
- **Usage**: Set this to the token provided by your IGRP Access Management administrator
- **Required when**: `IGRP_SYNC_ACCESS=true`
- **How to get**: Contact your IGRP Access Management administrator
- **Security**: Keep this token secure and never commit it to version control

## 📜 Available Scripts

### Development

```bash
# Start development server with Turbopack
pnpm dev

# Format code with Biome
pnpm format

# Lint and fix code with Biome
pnpm lint
```

### Production

```bash
# Build for production (includes formatting)
pnpm build

# Start production server
pnpm start
```

## 🏗️ How It's Built

### Architecture Overview

The template follows Next.js 15 App Router architecture with the following key components:

#### 1. **Root Layout** (`src/app/layout.tsx`)

- Provides global layout structure
- Configures metadata and viewport
- Wraps application with IGRP root layout

#### 2. **IGRP Layout** (`src/app/(igrp)/layout.tsx`)

- Handles authentication checks
- Manages session state
- Redirects unauthenticated users to login
- Wraps routes with IGRP layout components (header, sidebar)

#### 3. **Middleware** (`src/middleware.ts`)

- Intercepts requests before they reach pages
- Validates authentication tokens
- Handles public paths (login, logout, API routes)
- Supports preview mode bypass

#### 4. **Configuration Builder** (`src/igrp.template.config.ts`)

- Builds IGRP configuration object
- Loads mock data for preview mode
- Configures layout, API, and toaster settings
- Manages session configuration

#### 5. **Server Actions** (`src/actions/igrp/`)

- `layout.ts`: Fetches layout configuration and session
- `auth.ts`: Authentication-related actions

### Key Technologies

- **Next.js 15**: React framework with App Router
- **Turbopack**: Fast bundler for development
- **TypeScript**: Type-safe JavaScript
- **NextAuth.js**: Authentication library
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **Biome**: Fast formatter and linter

### Data Flow

1. **Request arrives** → Middleware checks authentication
2. **Authenticated** → Request proceeds to layout
3. **Layout loads** → Fetches configuration and session
4. **Configuration built** → IGRP layout components render
5. **Page renders** → With header, sidebar, and content

## 🔒 Authentication

The template uses NextAuth.js for authentication. Configuration is in `src/lib/auth-options.ts`.

### Authentication Flow

1. User visits protected route
2. Middleware checks for valid session
3. If no session → Redirect to `/login`
4. User authenticates → Session created
5. User redirected to original destination

### Customizing Authentication

To customize authentication:

1. Edit `src/lib/auth-options.ts` to configure providers
2. Update `src/app/(auth)/login/page.tsx` for custom login UI
3. Modify `src/middleware.ts` for custom auth logic

## 👁️ Preview Mode

Preview mode allows you to develop and test without authentication:

```env
IGRP_PREVIEW_MODE=true
```

When enabled:

- Authentication checks are bypassed
- Mock data is used for menus, users, and applications
- Session refetching is disabled
- No redirects to login page

**Mock data sources:**

- `src/temp/users/use-mock-user.ts`
- `src/temp/menus/use-mock-menus.ts`
- `src/temp/applications/use-mock-apps.ts`

## 🐳 Docker Support

### Development

```bash
docker build -f docker/development/Dockerfile -t my-igrp-template:latest .
docker run -d --name my-igrp-template -p 3000:3000 --restart unless-stopped --env-file docker/development/.env.development my-igrp-template:latest
```

### Production

Use the production Dockerfile with appropriate environment variables.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [IGRP Framework Documentation](https://github.com/NOSiCode-CV/IGRP-Framework)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contributing

Contributions are welcome! Please ensure you:

1. Follow the code style (Biome formatting)
2. Add appropriate TypeScript types
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by the IGRP Team**
