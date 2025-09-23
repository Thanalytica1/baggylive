# GymBag - Personal Training Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)

A comprehensive business management platform designed specifically for personal trainers, fitness coaches, and wellness professionals. GymBag simplifies client management, session scheduling, and payment tracking in one integrated application.

## 🎯 Features

### Core Functionality
- **📅 Sessions & Scheduling** - Create, complete, and track sessions instantly
- **👥 Client Management** - Detailed profiles with notes, history, and milestones
- **💰 Package & Payment Tracking** - Manage session packs and revenue
- **📊 Dashboard Analytics** - Track weekly sessions, monthly revenue, and client engagement
- **🔄 Lead Management** - Convert prospects into paying clients
- **🔔 Smart Reminders** - Automated follow-ups and renewal notifications

### Technical Features
- **🌙 Dark/Light Mode** - Seamless theme switching with system preference support
- **📱 Mobile-First Design** - Responsive interface that works anywhere
- **🔒 Multi-Tenant Architecture** - Secure data isolation for each trainer
- **⚡ Edge Runtime** - Optimized for performance with Vercel deployment
- **🛡️ Row Level Security** - Database-level security with Supabase RLS

## 🚀 Quick Start

### Prerequisites
- Node.js 20.0.0 or higher
- pnpm 9.0.0 or higher
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gymbag.git
   cd gymbag
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
- **Authentication**: Supabase Auth
- **Deployment**: [Vercel](https://vercel.com/)

## 📁 Project Structure

```
baggylive-main/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── clients/           # Client management
│   ├── sessions/          # Session scheduling
│   ├── packages/          # Package management
│   └── payments/          # Payment tracking
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── clients/          # Client-specific components
│   └── sessions/         # Session-specific components
├── lib/                   # Utility functions
│   └── supabase/         # Database client utilities
├── scripts/              # Database setup scripts
└── styles/               # Global styles
```

## 🗄️ Database Setup

1. **Create a Supabase project**
   Visit [supabase.com](https://supabase.com) and create a new project

2. **Run database migrations**
   Execute the SQL scripts in order:
   ```sql
   -- Run in Supabase SQL editor
   \i scripts/001_setup_rls_policies.sql
   \i scripts/002_create_profile_trigger.sql
   ```

3. **Enable Row Level Security**
   All tables are protected with RLS policies for multi-tenant data isolation

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔮 Roadmap

- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Mobile app (React Native)
- [ ] Email automation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video session support
- [ ] Nutrition tracking module

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for seamless deployment

---

Built with ❤️ for personal trainers and fitness professionals