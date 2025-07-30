# Kurukshetra: Advanced Cybersecurity Training Platform 🛡️

<div align="center">
  <img src="https://img.shields.io/badge/Security-Training-red?style=for-the-badge" alt="Security Training">
  <img src="https://img.shields.io/badge/OWASP-Top%2010-orange?style=for-the-badge" alt="OWASP Top 10">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-blue?style=for-the-badge" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge" alt="TypeScript">
  <img src="https://img.shields.io/badge/MongoDB-Primary-green?style=for-the-badge" alt="MongoDB">
</div>

## 🎯 Mission Statement

**Kurukshetra** is a comprehensive, hands-on cybersecurity training platform that provides interactive demonstrations of the **OWASP Top 10 (2021)** vulnerabilities in a safe, controlled environment. Named after the legendary battlefield, this platform serves as the training ground for ethical hackers, security professionals, and developers to sharpen their skills against real-world web application vulnerabilities.

> ⚠️ **Educational Purpose Only**: This application contains intentionally vulnerable code designed for cybersecurity training. Never deploy to production environments.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.3.3 with App Router, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI built on Radix primitives
- **Backend**: Next.js API Routes with Node.js runtime
- **Authentication**: JWT with intentionally weak configurations for training
- **Databases**: Dual-database system (MongoDB primary, SQLite fallback)
- **Validation**: Zod schemas with React Hook Form
- **Deployment**: Firebase Hosting ready, Docker containerization support

### Dual-Database Architecture
Kurukshetra features a robust dual-database architecture, dynamically switching between MongoDB and SQLite to demonstrate various injection vulnerabilities:

- **MongoDB**: Primary database for NoSQL injection and modern web app simulations
- **SQLite**: Fallback database for SQL injection and lightweight demonstrations

### Key Components
```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/                  # Authentication pages
│   ├── register/               # Registration pages
│   └── vulnerabilities/        # Vulnerability modules
├── components/                 # Reusable UI components
│   ├── ui/                     # Base UI components (Radix)
│   ├── database-toggle.tsx     # Database switching UI
│   ├── header.tsx              # Navigation header
│   ├── loading-spinner.tsx     # Loading components
│   └── page-transition.tsx     # Animation components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
│   ├── db.ts                   # Multi-database abstraction
│   ├── auth.ts                 # Authentication utilities
│   └── vulnerabilities.ts      # Vulnerability definitions
├── pages/api/                  # API routes
└── scripts/                    # Build & test scripts
```

## 🚀 Features

### Core Functionality
- **OWASP Top 10 Coverage**: Complete implementation of all OWASP Top 10 vulnerabilities
- **Multi-Database Support**: Dynamic switching between SQLite and MongoDB for different vulnerability contexts
- **Real-time Database Toggle**: Live environment switching with seamless UI transitions
- **CTF-Style Flag System**: Gamified learning with flag capture mechanics
- **Professional UI/UX**: Modern, responsive design with smooth animations

### Security Vulnerabilities Implemented
1. **A01: Broken Access Control** - User data exposure and privilege escalation
2. **A02: Cryptographic Failures** - Plaintext password storage and weak encryption
3. **A03: Injection** - SQL and NoSQL injection vulnerabilities
4. **A04: Insecure Design** - Fundamental security design flaws
5. **A05: Security Misconfiguration** - Exposed environment variables and configs
6. **A06: Vulnerable Components** - Known vulnerable dependencies
7. **A07: Authentication Failures** - Weak JWT secrets and auth bypass
8. **A08: Software & Data Integrity** - Unsigned/unverified data processing
9. **A09: Security Logging Failures** - Insufficient logging and monitoring
10. **A10: SSRF** - Server-Side Request Forgery with file protocol access

### UI/UX Features
- **Smooth Page Transitions**: Enhanced Framer Motion animations
- **Loading States**: Professional loading spinners and skeleton screens
- **Database Status Indicator**: Real-time database environment display
- **Progress Tracking**: Visual progress bars for completed vulnerabilities
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Professional dark mode interface

## 🛠️ Installation & Setup

### Prerequisites
- Node.js ≥18.0.0
- npm ≥9.0.0
- MongoDB Atlas account (optional, for MongoDB features)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/kurukshetra.git
cd kurukshetra

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server with SQLite (default)
npm run dev

# Or start with MongoDB
npm run setup:mongodb
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database Configuration
DB_TYPE=sqlite                    # 'sqlite' or 'mongo'
MONGODB_URI=your-mongodb-uri     # Required for MongoDB

# Authentication
JWT_SECRET=your-jwt-secret       # Intentionally weak for demos

# Exposed API Key (Vulnerability Demo)
NEXT_PUBLIC_LEAKED_API_KEY=FLAG{3xp0s3d_3nv_v4r_m1sc0nf1g}
```

## 🎮 Usage

### Database Environment Switching
Kurukshetra features live database switching between SQL and NoSQL environments:

1. **SQLite Mode**: Perfect for SQL injection demonstrations
2. **MongoDB Mode**: Ideal for NoSQL injection vulnerabilities
3. **Real-time Toggle**: Switch environments without restarting

### Vulnerability Exploration
1. **Browse Modules**: Explore OWASP Top 10 vulnerabilities
2. **Interactive Demos**: Hands-on exploitation practice
3. **Flag Capture**: Discover hidden flags in vulnerabilities
4. **Progress Tracking**: Monitor learning progress

### Development Commands

```bash
# Development
npm run dev                      # Start development server
npm run build                    # Build for production
npm run start                    # Start production server

# Database Operations
npm run setup:sqlite             # Configure SQLite environment
npm run setup:mongodb            # Configure MongoDB environment
npm run seed:auto                # Auto-seed database
npm run seed:force               # Force re-seed database
npm run reset:db                 # Reset database

# Testing & Validation
npm run test                     # Run all tests
npm run test:security            # Validate vulnerability implementations
npm run test:endpoints           # Validate API endpoints
npm run lint                     # Run ESLint
npm run typecheck                # TypeScript validation
```

## 🔧 Architecture

### Project Structure
```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/                  # Authentication pages
│   ├── register/               # Registration pages
│   └── vulnerabilities/        # Vulnerability modules
├── components/                 # Reusable UI components
│   ├── ui/                     # Base UI components (Radix)
│   ├── database-toggle.tsx     # Database switching UI
│   ├── header.tsx              # Navigation header
│   ├── loading-spinner.tsx     # Loading components
│   └── page-transition.tsx     # Animation components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
│   ├── db.ts                   # Multi-database abstraction
│   ├── auth.ts                 # Authentication utilities
│   └── vulnerabilities.ts      # Vulnerability definitions
├── pages/api/                  # API routes
└── scripts/                    # Build & test scripts
```

### Database Abstraction Layer
Kurukshetra implements a unified database interface that seamlessly switches between SQL and NoSQL databases:

```typescript
// Unified API works with both SQLite and MongoDB
export async function findUserByEmail(email: string): Promise<User | null>
export async function createUser(userData: UserData): Promise<User>
export async function searchUsers(term: string): Promise<{email: string}[]>
```

## 🧪 Testing & Validation

Kurukshetra includes comprehensive testing suites:

### Security Validation
- **Vulnerability Tests**: Verify all OWASP Top 10 implementations
- **Flag Validation**: Ensure CTF flags are properly placed
- **Injection Points**: Validate SQL/NoSQL injection vulnerabilities

### Endpoint Validation
- **API Coverage**: Test all authentication and vulnerability endpoints
- **Database Compatibility**: Verify multi-database functionality
- **Error Handling**: Validate security-appropriate error responses

### Code Quality
- **ESLint Rules**: Custom rules for security training context
- **TypeScript**: Strict type checking with security considerations
- **Component Testing**: UI component validation

## 🚨 Security Notice

**⚠️ WARNING: This application is intentionally vulnerable!**

Kurukshetra is designed for educational purposes and contains deliberate security flaws:

- **Never deploy to production** or publicly accessible servers
- **Use only in controlled environments** (localhost, isolated networks)
- **Contains real vulnerabilities** that could be exploited maliciously
- **Stores passwords in plaintext** for demonstration purposes
- **Uses weak JWT secrets** to demonstrate authentication flaws

## 📚 Educational Resources

### Learning Objectives
- **Identify Security Vulnerabilities**: Learn to spot common security flaws
- **Exploit Techniques**: Practice ethical hacking methodologies
- **Secure Coding**: Understand how to prevent these vulnerabilities
- **Penetration Testing**: Develop real-world security testing skills

### OWASP References
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/)

## 🤝 Contributing

We welcome contributions to improve Kurukshetra's educational value:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-vulnerability`
3. **Add your vulnerability module** with proper documentation
4. **Include tests**: Add validation for your vulnerability
5. **Submit a pull request** with detailed explanation

### Contribution Guidelines
- **Educational Focus**: Ensure contributions serve educational purposes
- **Security Context**: Include proper warnings and educational notes
- **Code Quality**: Follow TypeScript and ESLint standards
- **Testing**: Include comprehensive tests for new features
- **Documentation**: Update README and inline documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OWASP Foundation** for security vulnerability research and standards
- **Security Community** for responsible disclosure and education
- **Open Source Contributors** who make educational security tools possible

## 📞 Support

For questions, issues, or educational inquiries:

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join community discussions about security education
- **Email**: [brother.rohit.dev@gmail.com](mailto:brother.rohit.dev@gmail.com)

---

**Remember**: Use Kurukshetra responsibly for educational purposes only. Always obtain proper authorization before testing security concepts on systems you don't own.

*Built with ❤️ for the cybersecurity education community*
