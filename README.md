# Document Management System (DMS)

A modern, full-stack Document Management System MVP built with Next.js 14, TypeScript, and Tailwind CSS 4.

## ✨ Features

- 📁 **Document Management**: Upload, view, download, and delete documents (PDF, DOCX, XLSX, JPG, PNG)
- 🗂️ **Folder Organization**: Hierarchical folder structure with nested subfolders
- 🔍 **Search & Filter**: Search by filename, filter by type, tags, and date
- 🏷️ **Document Tagging**: Add and manage tags for better organization
- 🌐 **Bilingual Support**: Full English and Lao language support
- 📱 **Progressive Web App**: Installable with offline support
- 🔒 **Authentication**: Secure JWT-based authentication with role-based access
- 👥 **User Roles**: Admin, User, and Viewer roles with appropriate permissions
- 📊 **Admin Panel**: User management and system statistics
- 🎨 **Custom Design**: Beautiful UI with custom color palette

## 🚀 Tech Stack

### Frontend & Backend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **PWA**: next-pwa

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma 6.2.0

### Authentication
- **Auth**: NextAuth.js v5 (Auth.js)
- **Strategy**: JWT sessions
- **Password Hashing**: bcrypt

### Internationalization
- **i18n**: next-intl
- **Languages**: English (en), Lao (lo)

### File Handling
- **Storage**: Local filesystem (MVP)
- **Image Processing**: Sharp
- **PDF Handling**: pdf-lib, react-pdf
- **Upload**: react-dropzone
- **Max File Size**: 10MB

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maxonreid/document-management-system-frontend.git
   cd document-management-system-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dms"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   ```

4. **Set up the database**
   ```bash
   # Push the schema to the database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   
   # Seed initial data (creates admin and test users)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Default Users

After seeding, you can log in with:

**Admin User:**
- Email: `admin@dms.com`
- Password: `admin123`

**Regular User:**
- Email: `user@dms.com`
- Password: `user123`

## 📁 Project Structure

```
document-management-system-frontend/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth route group
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/            # Main dashboard
│   │   ├── documents/            # Document management
│   │   ├── folders/              # Folder management
│   │   ├── search/               # Search page
│   │   └── settings/             # User settings
│   ├── admin/                    # Admin panel
│   │   └── users/                # User management
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── documents/            # Document CRUD
│   │   ├── folders/              # Folder CRUD
│   │   ├── tags/                 # Tag management
│   │   └── users/                # User management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── documents/                # Document components
│   ├── folders/                  # Folder components
│   ├── layout/                   # Layout components
│   └── ui/                       # UI primitives
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client
│   ├── utils.ts                  # Helper functions
│   ├── validations.ts            # Zod schemas
│   └── constants.ts              # App constants
├── prisma/                       # Prisma configuration
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script
├── messages/                     # i18n translations
│   ├── en.json                   # English
│   └── lo.json                   # Lao
├── public/                       # Static files
│   ├── icons/                    # PWA icons
│   ├── manifest.json             # PWA manifest
│   └── offline.html              # Offline page
└── types/                        # TypeScript types
```

## 🎨 Color Palette

The app uses a carefully selected color palette:

- **Primary Blue** (`#0B2F4A`): Headers, navigation, focus states
- **Secondary Blue** (`#1F4E6D`): Secondary elements, hover states
- **Accent Gold** (`#F2B705`): Primary buttons, CTAs, highlights
- **Background Light** (`#F5F7FA`): Page backgrounds, cards
- **Text Primary** (`#1A1A1A`): Headings, important text
- **Text Secondary** (`#6B7280`): Body text, descriptions

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt (10 rounds)
- File type and size validation
- SQL injection prevention (Prisma)
- XSS prevention (React auto-escaping)
- Protected API routes
- Environment variable security

## 🌍 Internationalization

The app supports English and Lao languages. Use the language switcher in the header to change languages. The preference is persisted across sessions.

### Adding Translations

1. Add keys to `messages/en.json` and `messages/lo.json`
2. Use in components with `useTranslations` hook:
   ```tsx
   import { useTranslations } from 'next-intl';
   
   const t = useTranslations('common');
   return <h1>{t('appName')}</h1>;
   ```

## 📱 PWA Features

The app is a Progressive Web App with:
- Installable on mobile and desktop
- Offline fallback page
- Service worker for caching
- App manifest with icons

To test PWA features:
1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Open in Chrome and click "Install" in the address bar

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run type-check      # Run TypeScript compiler
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Documents
- `GET /api/documents` - List documents (with filters)
- `POST /api/documents/upload` - Upload document(s)
- `GET /api/documents/[id]` - Get document details
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `GET /api/documents/[id]/download` - Download document

### Folders
- `GET /api/folders` - List folders (tree or flat)
- `POST /api/folders` - Create folder
- `GET /api/folders/[id]` - Get folder details
- `PATCH /api/folders/[id]` - Update folder
- `DELETE /api/folders/[id]` - Delete folder

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag (admin only)

### Users (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user

## 🚀 Deployment

### Environment Variables

Set these in your production environment:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
UPLOAD_DIR="/var/uploads"
NODE_ENV="production"
```

### Build

```bash
npm run build
npm start
```

### Recommended Platforms
- Vercel (recommended for Next.js)
- Railway (with PostgreSQL)
- Render
- AWS (EC2 + RDS)

## 🐛 Troubleshooting

**Database connection failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Ensure database exists

**File uploads not working:**
- Check UPLOAD_DIR exists and is writable
- Verify MAX_FILE_SIZE setting
- Check disk space

**Authentication errors:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Radix UI for accessible components
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@dms.com

---

Built with ❤️ using Next.js 14 and TypeScript