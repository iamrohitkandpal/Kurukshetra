# 🚀 Kurukshetra Deployment Guide

## ✅ Pre-Deployment Checklist

### 🔧 Code Quality & Security
- [x] **ESLint**: All warnings resolved
- [x] **TypeScript**: Type checking passes without errors
- [x] **Security Tests**: All 14/14 vulnerability implementations verified
- [x] **Build Process**: Production build completes successfully
- [x] **Dependencies**: All security vulnerabilities patched (npm audit shows 0 vulnerabilities)

### 📊 Database Systems
- [x] **SQLite**: In-memory and persistent database working
- [x] **MongoDB**: Connection and operations validated
- [x] **Database Scripts**: Reset and cleanup scripts functional
- [x] **Multi-DB Toggle**: Live switching between databases working

### 🌐 Environment Configuration
- [x] **Environment Variables**: All required variables documented in .env.local
- [x] **JWT Configuration**: Intentionally weak secret for educational purposes
- [x] **API Endpoints**: All 9 API routes functional and tested

### 🎯 OWASP Top 10 Implementation
- [x] **A01 Broken Access Control**: Admin panel bypass implemented
- [x] **A02 Cryptographic Failures**: Base64 "encryption" demo
- [x] **A03 Injection**: SQL/NoSQL injection points active
- [x] **A04 Insecure Design**: Conceptual vulnerability demonstrated
- [x] **A05 Security Misconfiguration**: Exposed API key in NEXT_PUBLIC_ 
- [x] **A06 Vulnerable Components**: Dependency vulnerability table
- [x] **A07 Authentication Failures**: Plaintext password storage
- [x] **A08 Data Integrity**: Conceptual implementation
- [x] **A09 Logging Failures**: Minimal logging demonstrated
- [x] **A10 SSRF**: File protocol access enabled

### 🎮 User Experience
- [x] **Responsive Design**: Mobile-first approach with Tailwind CSS
- [x] **Loading States**: Professional spinners and transitions
- [x] **Error Handling**: Appropriate error messages
- [x] **Flag System**: CTF-style flag capture working
- [x] **Progress Tracking**: User authentication and flag storage

## 🔒 Security Warnings

**⚠️ CRITICAL SECURITY NOTICE:**

This application contains **intentional security vulnerabilities** for educational purposes:

1. **Never Deploy to Production** - This app is designed for controlled environments only
2. **Isolated Networks Only** - Use on localhost or completely isolated networks
3. **No Public Access** - Contains real exploitable vulnerabilities
4. **Educational Use Only** - Unauthorized use may violate laws and ethics

## 🌍 Deployment Options

### Option 1: Local Development (Recommended)
```bash
# Clone and setup
git clone <your-repo>
cd kurukshetra
npm install

# Start development server
npm run dev
```

### Option 2: Local Production Build
```bash
# Build for production
npm run build
npm run start
```

### Option 3: Docker Deployment (Isolated Networks)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 4: Internal Corporate Training
- Deploy on internal network only
- Ensure no external internet access
- Use VPN or isolated training environment
- Monitor all access and usage

## 🔧 Environment Setup

### Required Environment Variables
```env
# Database Configuration
DB_TYPE=sqlite                    # or 'mongo'
MONGODB_URI=mongodb://...         # if using MongoDB

# Authentication (Intentionally Weak)
JWT_SECRET=kurukshetra-weak-secret

# Vulnerability Demo (Exposed)
NEXT_PUBLIC_LEAKED_API_KEY=FLAG{3xp0s3d_3nv_v4r_m1sc0nf1g}

# Production Settings
NODE_ENV=production               # for persistent SQLite database
```

### Optional MongoDB Setup
If using MongoDB features:
1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in .env.local
5. Test with: `npm run setup:mongodb`

## 📈 Performance Optimization

### Pre-deployment Performance Checks
- [x] **Bundle Size**: ~201kB first load JS (optimized)
- [x] **Static Generation**: 19/19 pages pre-rendered
- [x] **Image Optimization**: Next.js automatic optimization
- [x] **Code Splitting**: Automatic route-based splitting

### Database Performance
- [x] **SQLite**: In-memory for development, persistent for production
- [x] **MongoDB**: Indexed queries for user lookup
- [x] **Connection Pooling**: Mongoose automatic pooling

## 🧪 Testing & Validation

### Automated Testing
```bash
# Run all tests
npm run test

# Individual test suites
npm run test:security      # Verify vulnerability implementations
npm run test:endpoints     # Validate API endpoints
npm run typecheck          # TypeScript validation
npm run lint              # Code quality checks
```

### Manual Testing Checklist
- [ ] All 10 vulnerability pages load correctly
- [ ] Database toggle switches environments
- [ ] User registration and login functional
- [ ] Flag submission system works
- [ ] SQL injection demo returns data
- [ ] SSRF demo can access file:// protocol
- [ ] Admin panel accessible without authentication

## 🚨 Incident Response Plan

### If Deployed Accidentally to Production
1. **IMMEDIATE**: Take the application offline
2. **Assess**: Check access logs for unauthorized activity
3. **Secure**: Change all passwords and API keys
4. **Audit**: Review what data may have been compromised
5. **Report**: Follow your organization's incident response procedures

### Monitoring (For Training Environments)
- Monitor access logs for learning purposes
- Track which vulnerabilities are being exploited
- Log successful flag captures for training metrics
- Monitor resource usage during training sessions

## 📚 Training Deployment Best Practices

### For Educators
1. **Controlled Environment**: Always use isolated networks
2. **User Management**: Create accounts for students beforehand
3. **Session Monitoring**: Track progress and flag captures
4. **Time Limits**: Set clear training session boundaries
5. **Cleanup**: Reset database between training sessions

### For Students
1. **Ethical Use**: Only test on provided training environment
2. **Documentation**: Keep notes on vulnerability discovery methods
3. **Respect Boundaries**: Don't attempt to access underlying infrastructure
4. **Report Issues**: Report technical problems (not security issues)

## 🔄 Maintenance

### Regular Maintenance Tasks
```bash
# Weekly
npm audit fix              # Update dependencies
npm run reset:db          # Reset training environment
npm run seed:auto         # Repopulate with fresh data

# Monthly  
npm update                # Update all packages
npm run build             # Verify build still works
npm run test              # Validate all functionality

# As Needed
npm run cleanup:db        # Remove duplicate users
```

### Database Maintenance
- **SQLite**: Database file will grow over time, reset periodically
- **MongoDB**: Monitor document count and reset collections as needed
- **User Data**: Purge old training accounts regularly

## 🏁 Final Deployment Steps

1. **Final Test**: Run complete test suite
   ```bash
   npm run test
   ```

2. **Production Build**: Verify clean build
   ```bash
   npm run build
   ```

3. **Environment Setup**: Configure .env.local
4. **Database Setup**: Initialize with seed data
   ```bash
   npm run seed:auto
   ```

5. **Security Verification**: Confirm vulnerabilities work as expected
6. **Access Control**: Restrict to appropriate network/users
7. **Monitoring Setup**: Enable appropriate logging for training context
8. **Documentation**: Ensure all users have proper training materials

---

**Remember**: Kurukshetra is a powerful educational tool. Use it responsibly and always prioritize security and ethical considerations in your training programs.

## ✅ Deployment Ready!

Your Kurukshetra installation is now ready for deployment in appropriate educational environments. All systems have been tested and verified for optimal security training delivery.

For questions or support: [brother.rohit.dev@gmail.com](mailto:brother.rohit.dev@gmail.com)
