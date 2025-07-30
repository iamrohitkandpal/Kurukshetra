# Kurukshetra: Professional OWASP Top 10 Security Training Platform

## 🎯 Project Overview

**Mission**: Provide hands-on, interactive cybersecurity training through intentionally vulnerable web applications that demonstrate real-world OWASP Top 10 vulnerabilities in a safe, controlled environment.

**Target Audience**: 
- Cybersecurity professionals and students
- Web developers learning secure coding practices
- Security trainers and educators
- Penetration testers honing their skills

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: ShadCN UI built on Radix primitives
- **State Management**: React Context API for authentication and global state
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions and interactions

### Backend Stack
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: JWT with intentionally weak configurations for educational purposes
- **Database**: Dual-database architecture (MongoDB primary, SQLite fallback)
- **File Operations**: Node.js fs module for file system vulnerabilities
- **Logging**: Custom logging system with intentional gaps for A09 demonstrations

### Database Architecture
- **Primary Database**: MongoDB for document-based operations and NoSQL injection demos
- **Secondary Database**: SQLite for SQL injection demonstrations and fallback operations
- **Dual-Sync System**: Authentication events synchronized across both databases
- **Dynamic Switching**: Runtime database switching for different attack scenarios

---

## 🔐 Core Vulnerability Modules

### A01: Broken Access Control (Critical Priority)
**Implementation Features**:
- Admin panel with client-side only authorization checks
- Insecure Direct Object References (IDOR) in tenant data access
- Horizontal privilege escalation through user ID manipulation
- Vertical privilege escalation via alternative admin endpoints
- Role-based access control bypasses

**Training Scenarios**:
- Tenant data access modification (`/api/tenants/[id]/data`)
- Admin settings manipulation through weak email-based checks
- User profile access across different accounts
- Business logic bypasses in administrative functions

### A02: Cryptographic Failures
**Implementation Features**:
- Plaintext password storage alongside weak bcrypt hashing (3 rounds)
- Base64 encoding presented as encryption in client demonstrations
- JWT secrets exposed in client-side JavaScript
- Weak encryption key management and storage

**Training Scenarios**:
- Password hash cracking with low bcrypt rounds
- JWT token forgery using exposed secrets
- Base64 decoding of "encrypted" data
- Client-side secret extraction from browser console

### A03: Injection Vulnerabilities
**Implementation Features**:
- SQL injection in user search functionality
- Second-order SQL injection through profile data storage
- NoSQL injection in MongoDB query operations
- Command injection possibilities in admin functions

**Advanced Techniques**:
- Blind SQL injection with boolean-based detection
- Time-based SQL injection with response timing analysis
- Union-based injection for data extraction
- Second-order injection workflow (store → execute)

### A04: Insecure Design
**Implementation Features**:
- Multi-step registration process with step bypass capabilities
- Client-side business logic trust in e-commerce flows
- Price manipulation in purchase systems
- Process flow assumptions allowing arbitrary progression jumps

**Business Logic Flaws**:
- Registration step sequence manipulation
- Financial calculation override on client-side
- Discount and pricing validation bypasses
- Multi-step workflow state management failures

### A05: Security Misconfiguration
**Implementation Features**:
- Environment variables exposed in client-side code
- Verbose error messages revealing system information
- Default credentials prominently displayed for training
- Development features accessible in production-like environment

**Configuration Issues**:
- Sensitive data in `window.KURUKSHETRA_CONFIG`
- Stack traces exposed in API error responses
- Debug endpoints accessible without authentication
- CORS and security header misconfigurations

### A06: Vulnerable and Outdated Components
**Implementation Features**:
- Intentionally outdated package version references
- Known CVE demonstrations in component listings
- Dependency vulnerability information exposed through APIs
- Supply chain security awareness components

### A07: Identification and Authentication Failures
**Implementation Features**:
- Timing attack vulnerabilities in login endpoints
- Username enumeration through response timing differences
- Weak password policies and storage mechanisms
- JWT token vulnerabilities and session management issues

**Advanced Attack Vectors**:
- Response timing analysis for valid vs. invalid users
- Offline password cracking scenarios
- JWT secret discovery through exposed configuration
- Session fixation and hijacking demonstrations

### A08: Software and Data Integrity Failures
**Implementation Features**:
- Client-side data validation without server-side verification
- Unsigned code update mechanisms
- Data integrity bypass scenarios in business logic

### A09: Security Logging and Monitoring Failures
**Implementation Features**:
- Insufficient security event logging
- Sensitive information included in accessible log files
- No alerting for suspicious activity patterns
- Missing audit trails for critical operations

### A10: Server-Side Request Forgery (SSRF)
**Implementation Features**:
- URL fetching endpoint with insufficient validation
- Internal network access through SSRF exploitation
- File system access via protocol manipulation
- Filter bypass techniques for restricted URLs

**Advanced SSRF Techniques**:
- IPv4 address manipulation (127.1, 2130706433)
- IPv6 localhost access ([::1])
- File protocol exploitation (file://)
- Cloud metadata service access simulation

---

## 🎨 Design System and User Experience

### Color Palette
```css
/* Primary Colors - Security Theme */
--primary: 210 40% 98%           /* Bright white for contrast */
--primary-foreground: 222.2 47.4% 11.2%  /* Dark navy */

/* Alert and Warning Colors */
--destructive: 0 62.8% 30.6%     /* Deep red for critical vulnerabilities */
--warning: 38 92% 50%            /* Bright orange for warnings */
--success: 142 71% 45%           /* Green for successful exploits */

/* Background and Surface Colors */
--background: 222.2 84% 4.9%     /* Very dark background */
--card: 222.2 84% 4.9%           /* Matching card background */
--secondary: 217.2 32.6% 17.5%   /* Lighter secondary surface */

/* Accent Colors */
--accent-yellow: #FFDA63         /* Bright yellow for highlights */
--accent-red: #A81B0D            /* Alert red for critical items */
```

### Typography System
```css
/* Font Stack */
--font-inter: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
--font-code: 'Source Code Pro', 'Fira Code', 'Consolas', monospace;

/* Font Sizes and Weights */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
```

### Component Design Patterns

**Vulnerability Cards**:
- Severity indicators with color-coded badges
- Progress tracking with completion states
- Interactive hover effects and transitions
- Icon system using Lucide React icons

**Code Blocks**:
- Syntax highlighting for multiple languages
- Vulnerable vs. secure code comparisons
- Copy-to-clipboard functionality
- Expandable/collapsible sections for long code

**Navigation**:
- Responsive header with user authentication state
- Progress indicators for training completion
- Breadcrumb navigation for deep-linked content
- Mobile-optimized hamburger menu

### Accessibility Features
- WCAG 2.1 AA compliance for color contrast
- Keyboard navigation support
- Screen reader optimized content structure
- Focus management for interactive elements
- Alternative text for all icons and images

---

## 🎯 User Experience Flow

### 1. Registration and Onboarding
```
Landing Page → Registration → Email Verification → Profile Setup → Dashboard
```
- **Registration**: Demonstrates A04 (step bypass) and A07 (weak validation)
- **Profile Setup**: Introduces users to security concepts
- **Dashboard**: Overview of available vulnerability modules

### 2. Training Module Experience
```
Module Selection → Overview → Interactive Demo → Code Analysis → Flag Submission → Progress Update
```
- **Interactive Demos**: Hands-on exploitation of real vulnerabilities
- **Code Analysis**: Side-by-side vulnerable vs. secure implementations
- **Flag Submission**: CTF-style completion verification
- **Progress Tracking**: Individual and overall completion metrics

### 3. Advanced Training Paths
```
Basic Vulnerabilities → Advanced Techniques → Business Logic Flaws → Real-world Scenarios
```
- **Skill Progression**: Guided learning path from basic to advanced
- **Specialization Tracks**: Focus areas like web apps, APIs, or mobile
- **Certification**: Completion certificates for training modules

---

## 🔧 Development and Deployment Architecture

### Local Development Setup
```bash
# Environment Setup
git clone [repository-url]
cd kurukshetra
npm install

# Database Initialization
npm run db:setup
npm run db:seed

# Development Server
npm run dev
```

### Environment Configuration
```bash
# .env.local structure
DB_TYPE=mongo                    # Primary database type
MONGODB_URI=mongodb://localhost:27017/kurukshetra
JWT_SECRET=training-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Intentionally exposed for training
NEXT_PUBLIC_LEAKED_API_KEY=sk_live_exposed_key
NEXT_PUBLIC_DEBUG_MODE=true
```

### Docker Containerization
```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS dependencies
# ... dependency installation

FROM node:18-alpine AS builder  
# ... build process

FROM node:18-alpine AS runner
# ... runtime configuration
```

### Firebase Deployment Strategy
```yaml
# firebase.json configuration
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

### Cloud Platform Support
- **Firebase Hosting**: Static site deployment with CDN
- **Vercel**: Serverless deployment with automatic scaling  
- **AWS**: Container deployment with ECS or Lambda
- **Google Cloud**: App Engine or Cloud Run deployment
- **Azure**: Container Instances or App Service deployment

---

## 🛡️ Security Training Features

### CTF Integration
- **Flag System**: Hidden flags in successful vulnerability exploitations
- **Scoring**: Points awarded for discovery and exploitation
- **Leaderboards**: Competitive elements for training groups
- **Hints**: Progressive hint system for struggling learners
- **Writeups**: Detailed exploitation guides for learning reinforcement

### Progress Tracking
- **Individual Progress**: Per-user completion tracking across all modules
- **Organizational Dashboards**: Training progress for entire organizations
- **Skill Assessment**: Pre and post-training capability evaluation
- **Certification**: Completion certificates with verification codes

### Advanced Training Scenarios
- **Chained Exploits**: Multi-step attacks combining multiple vulnerabilities
- **Real-world Simulations**: Scenarios based on actual security incidents
- **Red Team Exercises**: Collaborative attack and defense training
- **API Security**: Dedicated modules for API-specific vulnerabilities

---

## 📊 Analytics and Monitoring

### Training Analytics
- **Completion Rates**: Module and overall training completion statistics
- **Time-to-Completion**: Learning velocity and difficulty analysis
- **Common Mistakes**: Areas where learners frequently struggle
- **Exploitation Success**: Vulnerability discovery and exploitation rates

### Security Monitoring
- **Attack Pattern Detection**: Identification of actual vs. training attacks
- **Anomaly Detection**: Unusual activity patterns in training environment
- **Incident Response**: Procedures for handling real security events
- **Compliance Reporting**: Training completion for regulatory requirements

### Performance Monitoring
- **Application Performance**: Response times and system resource usage
- **Database Performance**: Query optimization and connection pooling
- **User Experience**: Page load times and interaction responsiveness
- **Error Tracking**: Application errors and user experience issues

---

## 🚀 Deployment and Scaling Considerations

### Infrastructure Requirements
- **Compute**: Minimum 2 CPU cores, 4GB RAM for basic deployment
- **Storage**: 10GB for application and database storage
- **Network**: HTTPS-only deployment with proper SSL/TLS configuration
- **Monitoring**: Application and infrastructure monitoring setup

### Scaling Strategy
- **Horizontal Scaling**: Load balancer with multiple application instances
- **Database Scaling**: MongoDB replica sets, SQLite read replicas
- **Content Delivery**: CDN for static assets and improved global performance
- **Caching**: Redis for session management and frequently accessed data

### Security Hardening for Training Environment
- **Network Isolation**: Segregated network segments for training
- **Access Controls**: VPN or IP-based access restrictions
- **Monitoring**: Enhanced logging for training environment oversight
- **Data Protection**: Synthetic data only, no real user information

---

## 📚 Educational Resources and Documentation

### Training Materials
- **Video Tutorials**: Step-by-step exploitation demonstrations
- **Written Guides**: Detailed vulnerability explanations and mitigation strategies
- **Code Examples**: Vulnerable and secure implementation comparisons
- **Reference Materials**: Links to OWASP documentation and security resources

### Integration with Security Curricula
- **Academic Integration**: Alignment with cybersecurity degree programs
- **Professional Training**: Integration with security certification programs
- **Corporate Training**: Customizable modules for organizational security training
- **Continuing Education**: Regular updates with new vulnerability trends

### Community and Support
- **User Forums**: Community discussion and knowledge sharing
- **Expert Support**: Access to security professionals for guidance
- **Regular Updates**: Continuous improvement based on user feedback
- **Open Source**: Community contributions and transparency

---

## 🎓 Success Metrics and Outcomes

### Learning Effectiveness
- **Knowledge Retention**: Post-training assessment and long-term retention
- **Practical Application**: Real-world security improvement in participant organizations
- **Skill Development**: Measurable improvement in security testing capabilities
- **Certification Achievement**: Industry certification pass rates for training participants

### Business Impact
- **Reduced Security Incidents**: Fewer successful attacks in trained organizations
- **Improved Secure Coding**: Better security practices in development teams
- **Compliance Achievement**: Meeting security training requirements
- **Cost Savings**: Reduced security incident response and remediation costs

### Platform Success
- **User Engagement**: Active user counts and session duration
- **Training Completion**: Module and program completion rates
- **User Satisfaction**: Training effectiveness and user experience ratings
- **Industry Recognition**: Awards and recognition from cybersecurity community

---

This blueprint serves as the foundational design document for Kurukshetra, ensuring consistent development decisions and clear communication of the platform's educational mission and technical implementation.