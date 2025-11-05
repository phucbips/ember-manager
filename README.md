# 🎯 Ember Dashboard - Quiz Management System

Ember Dashboard là một hệ thống quản lý quiz hiện đại với Supabase authentication, xây dựng bằng Next.js 15.

## ✅ **Features**
- 🔐 Email/Password Authentication 
- 🌐 Google OAuth
- 👑 Admin whitelist system
- 🏆 Role-based access control
- 📱 Mobile responsive design
- 🛡️ Security middleware

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Environment**
```bash
# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Run Development**
```bash
npm run dev
```

## 🛠 **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **UI**: React 18

## 📦 **Key Dependencies**
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/supabase-js": "^2.39.0",
  "next": "^15.0.0",
  "react": "^18.0.0",
  "tailwindcss": "^3.4.0"
}
```

## 🌐 **Deploy on Vercel**

### **Step 1: Push to GitHub**
```bash
git push origin main
```

### **Step 2: Connect to Vercel**
1. Go to https://vercel.com/dashboard
2. Import GitHub repository
3. Vercel automatically detects Next.js

### **Step 3: Add Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 4: Deploy**
- Vercel runs: `npm run build`
- Auto-deploys to `your-app.vercel.app`

## 📁 **Project Structure**
```
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Auth pages
│   ├── page.tsx       # Home page
│   └── layout.tsx     # Root layout
├── components/        # React components
├── lib/              # Utilities & types
├── services/         # Business logic
└── middleware.ts     # Auth middleware
```

## 🔧 **Available Scripts**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📄 **License**
MIT License - Free to use and modify

---
**🚀 Ember Dashboard sẵn sàng deploy trên Vercel!**