# KURUKSHETRA TECHNICAL DOCUMENTATION ✨

<br>

## Table of Contents
1.  [Project Overview](#1-project-overview) 🚀
2.  [Architecture](#2-architecture) 🏗️
3.  [Database Design](#3-database-design) 🗄️
    * [3.1 MongoDB Schema (Primary Database)](#31-mongodb-schema-primary-database) 🌿
    * [3.2 SQLite Schema (Secondary Database)](#32-sqlite-schema-secondary-database) 🐘
4.  [API Endpoints](#4-api-endpoints) 🔗
5.  [Authentication System](#5-authentication-system) 🔑
6.  [Vulnerability Implementation Details](#6-vulnerability-implementation-details) 🐞
    * [A01:2021 – Broken Access Control](#a012021--broken-access-control) 🚫
    * [A02:2021 – Cryptographic Failures](#a022021--cryptographic-failures) 🔐
    * [A03:2021 – Injection](#a032021--injection) 💉
    * [A04:2021 – Insecure Design](#a042021--insecure-design) 🧠
    * [A05:2021 – Security Misconfiguration](#a052021--security-misconfiguration) ⚙️
    * [A06:2021 – Vulnerable Components](#a062021--vulnerable-components) 📦
    * [A07:2021 – Authentication & Identification Failures](#a072021--authentication--identification-failures) 👤
    * [A08:2021 – Software & Data Integrity Failures](#a082021--software--data-integrity-failures) 💾
    * [A09:2021 – Security Logging & Monitoring Failures](#a092021--security-logging--monitoring-failures) 📊
    * [A10:2021 – Server-Side Request Forgery (SSRF)](#a102021--server-side-request-forgery-ssrf) 🌐
7.  [Development Guidelines](#7-development-guidelines) 🧑‍💻
8.  [Testing](#8-testing) ✅
9.  [Security Considerations](#9-security-considerations) ⚠️

<br>

---

## 1. PROJECT OVERVIEW 🚀

**Kurukshetra** is an intentionally vulnerable web application designed for cybersecurity training and education. It implements the **OWASP Top 10 (2021)** vulnerabilities to provide a safe, controlled environment for security practitioners to improve their skills.

### **Technology Stack:**
* **Frontend**: Next.js 15.3.3 (React 18), TypeScript, Tailwind CSS
* **Backend**: Next.js API Routes (Node.js runtime)
* **Authentication**: JWT with intentionally weak configurations
* **Databases**: Dual-database system (MongoDB primary, SQLite fallback)
* **UI Components**: ShadCN UI, Radix UI primitives
* **Validation**: Zod schema validation, React Hook Form

<br>

---

## 2. ARCHITECTURE 🏗️

Kurukshetra features a modern full-stack architecture with intentional security flaws:

### **Frontend (Client-Side):**
* **Next.js App Router** for server-side rendering and routing
* **React components** with TypeScript for type safety
* **Tailwind CSS** for responsive styling
* **ShadCN UI** component library for consistent design
* **Context API** for global state management (auth, theme)
* Client-side routing with dynamic imports

### **Backend (Server-Side):**
* **Next.js API Routes** handling RESTful endpoints
* **Dual database abstraction layer** (MongoDB/SQLite)
* **JWT authentication** with weak secret management
* File system operations for vulnerability demonstrations
* Error handling that intentionally exposes stack traces

### **Database Layer:**
* **MongoDB (Primary)**: Document-based storage for user data
* **SQLite (Fallback)**: Relational database for SQL injection demos
* Dual-sync operations for authentication events
* Dynamic database switching for different attack vectors

<br>

---

## 3. DATABASE DESIGN 🗄️

### 3.1 MongoDB Schema (Primary Database) 🌿

**Collections:**
* `users`: User accounts with authentication details
    ```json
    {
      "_id": "ObjectId",
      "username": "String (unique)",
      "email": "String (unique)",
      "password": "String (plaintext - vulnerability)",
      "passwordHash": "String (bcrypt with low rounds)",
      "role": "String (user/admin/superadmin)",
      "flagsFound": "Array[String]",
      "lastLogin": "Date",
      "profile": "Object",
      "createdAt": "Date"
    }
    ```

### 3.2 SQLite Schema (Secondary Database) 🐘

**Tables:**
* `users`: Mirrors MongoDB structure for dual-sync
    ```sql
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      passwordHash TEXT,
      role TEXT DEFAULT 'user',
      flagsFound TEXT DEFAULT '[]',
      lastLogin DATETIME,
      profile TEXT DEFAULT '{}',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ```

<br>

---

## 4. API ENDPOINTS 🔗

**Base URL**: `/api`

### **Authentication Endpoints:**
* `POST /api/login` - User authentication with timing vulnerabilities
* `POST /api/register` - User registration with weak validation
* `POST /api/logout` - Session termination with dual-database logging

### **User Management:**
* `GET /api/users/[id]` - User profile retrieval (**IDOR vulnerability**)
* `GET /api/users/search` - User search with **SQL injection points**

### **Admin Endpoints (Broken Access Control):**
* `GET /api/admin/settings` - Admin settings (weak authorization)
* `POST /api/admin/update-settings` - Settings modification
* `GET /api/admin/secure-settings` - Properly secured admin endpoint (contrast)

### **Tenant/Multi-tenancy (IDOR Demonstration):**
* `GET /api/tenants/[id]/data` - Tenant data access (**insecure direct object reference**)

### **Vulnerability Demonstration:**
* `POST /api/flags/submit` - CTF flag submission system
* `GET /api/ssrf/fetch` - **Server-side request forgery** endpoint
* `POST /api/profile/update` - Profile update (**second-order SQLi**)
* `GET /api/profile/lookup` - Profile lookup triggering stored payloads

### **Business Logic Flaws:**
* `POST /api/registration/step1` - Multi-step registration (step bypass)
* `POST /api/registration/step2` - Profile information step
* `POST /api/registration/step3` - Final step (**business logic bypass**)
* `POST /api/purchase/order` - Order processing (**price manipulation**)

### **Database Management:**
* `POST /api/database/switch` - Dynamic database switching
* `GET /api/database/status` - Current database type

<br>

---

## 5. AUTHENTICATION SYSTEM 🔑

JWT-based authentication with intentional vulnerabilities:

### **Vulnerability Features:**
* Weak JWT secret (exposed in environment variables)
* Low bcrypt rounds (3 instead of 12+) for password hashing
* Timing attack vulnerabilities in login endpoint
* Plaintext password storage alongside hashed versions
* Client-side token storage in `localStorage`
* Missing server-side authorization checks

### **Authentication Flow:**
1.  User submits credentials via `/api/login`
2.  Server validates against dual-database system
3.  JWT token generated with weak secret
4.  Token returned to client (stored in `localStorage`)
5.  Subsequent requests include Bearer token
6.  Server validates token but with bypassable checks

### **Token Structure:**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "role": "string",
  "iat": "number",
  "iss": "kurukshetra-training",
  "exp": "number (1 hour)"
}
```

## 4. API ENDPOINTS 🔗

**Base URL**: `/api`

### **Authentication Endpoints:**
* `POST /api/login` - User authentication with timing vulnerabilities
* `POST /api/register` - User registration with weak validation
* `POST /api/logout` - Session termination with dual-database logging

### **User Management:**
* `GET /api/users/[id]` - User profile retrieval (**IDOR vulnerability**)
* `GET /api/users/search` - User search with **SQL injection points**

### **Admin Endpoints (Broken Access Control):**
* `GET /api/admin/settings` - Admin settings (weak authorization)
* `POST /api/admin/update-settings` - Settings modification
* `GET /api/admin/secure-settings` - Properly secured admin endpoint (contrast)

### **Tenant/Multi-tenancy (IDOR Demonstration):**
* `GET /api/tenants/[id]/data` - Tenant data access (**insecure direct object reference**)

### **Vulnerability Demonstration:**
* `POST /api/flags/submit` - CTF flag submission system
* `GET /api/ssrf/fetch` - **Server-side request forgery** endpoint
* `POST /api/profile/update` - Profile update (**second-order SQLi**)
* `GET /api/profile/lookup` - Profile lookup triggering stored payloads

### **Business Logic Flaws:**
* `POST /api/registration/step1` - Multi-step registration (step bypass)
* `POST /api/registration/step2` - Profile information step
* `POST /api/registration/step3` - Final step (**business logic bypass**)
* `POST /api/purchase/order` - Order processing (**price manipulation**)

### **Database Management:**
* `POST /api/database/switch` - Dynamic database switching
* `GET /api/database/status` - Current database type

<br>

---

## 5. AUTHENTICATION SYSTEM 🔑

JWT-based authentication with intentional vulnerabilities:

### **Vulnerability Features:**
* Weak JWT secret (exposed in environment variables)
* Low bcrypt rounds (3 instead of 12+) for password hashing
* Timing attack vulnerabilities in login endpoint
* Plaintext password storage alongside hashed versions
* Client-side token storage in `localStorage`
* Missing server-side authorization checks

### **Authentication Flow:**
1.  User submits credentials via `/api/login`
2.  Server validates against dual-database system
3.  JWT token generated with weak secret
4.  Token returned to client (stored in `localStorage`)
5.  Subsequent requests include Bearer token
6.  Server validates token but with bypassable checks

### **Token Structure:**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "role": "string",
  "iat": "number",
  "iss": "kurukshetra-training",
  "exp": "number (1 hour)"
}
````

\<br\>

-----

## 6\. VULNERABILITY IMPLEMENTATION DETAILS 🐞

Kurukshetra includes a complete OWASP Top 10 (2021) implementation:

-----

### A01:2021 – Broken Access Control 🚫

> 👉 **Description**: This category focuses on vulnerabilities where an attacker can bypass authorization checks to access or perform actions they are not permitted to.

**Implementation Details:**

  * Admin panel accessible via client-side role checks only
  * IDOR vulnerabilities in tenant data access (`/api/tenants/[id]/data`)
  * Alternative admin endpoints bypass proper authorization
  * Horizontal privilege escalation through tenant ID manipulation
  * User role elevation via email-based admin detection

**Attack Vectors:**

  * Modify tenant IDs to access other organizations' data
  * Register with admin-containing email addresses
  * Access admin endpoints through alternative routes
  * Bypass frontend restrictions via direct API calls

-----

### A02:2021 – Cryptographic Failures 🔐

> 👉 **Description**: Vulnerabilities related to improper cryptographic implementations, exposing sensitive data.

**Implementation Details:**

  * Passwords stored in plaintext (intentional vulnerability)
  * Bcrypt hashing with dangerously low rounds (3)
  * Base64 encoding presented as encryption in crypto demos
  * JWT secrets exposed in client-side JavaScript
  * Sensitive data transmission without proper encryption

**Attack Vectors:**

  * Offline password cracking due to low bcrypt rounds
  * JWT token forgery using exposed secrets
  * Base64 decoding to reveal "encrypted" data
  * Client-side secret extraction from browser console

-----

### A03:2021 – Injection 💉

> 👉 **Description**: This covers vulnerabilities where untrusted data is sent to an interpreter as part of a command or query.

**Implementation Details:**

  * Direct SQL query construction in `searchUsers` function
  * User input concatenated into SQL queries without sanitization
  * Second-order SQL injection via profile bio storage
  * NoSQL injection points in MongoDB queries
  * Error messages revealing database structure

**Attack Vectors:**

  * Classic SQL injection: `' OR '1'='1' --`
  * UNION-based injection for data extraction
  * Second-order injection via profile update → lookup
  * NoSQL injection using MongoDB operators
  * Boolean-based blind SQL injection

-----

### A04:2021 – Insecure Design 🧠

> 👉 **Description**: A new category that focuses on design flaws and architectural weaknesses that lead to security vulnerabilities.

**Implementation Details:**

  * Multi-step registration process with step bypass capability
  * Client-side price calculations in purchase system
  * Business logic validation only on final steps
  * Process flow assumes linear progression but allows jumps

**Attack Vectors:**

  * Skip registration validation steps via direct API calls
  * Manipulate product prices during checkout
  * Bypass required fields by jumping to final steps
  * Exploit client-side calculation trust

-----

### A05:2021 – Security Misconfiguration ⚙️

> 👉 **Description**: This vulnerability occurs when security settings are improperly configured, leading to exposed data or compromised systems.

**Implementation Details:**

  * Environment variables exposed in client-side JavaScript
  * Verbose error messages revealing stack traces
  * Default credentials in training accounts
  * Development features enabled in production-like environment

**Attack Vectors:**

  * Extract secrets from `window.KURUKSHETRA_CONFIG`
  * Use default admin credentials from login page
  * Analyze stack traces for system information
  * Access development endpoints

-----

### A06:2021 – Vulnerable Components 📦

> 👉 **Description**: Using components (libraries, frameworks, other software modules) with known vulnerabilities.

**Implementation Details:**

  * Intentionally outdated package versions in vulnerability table
  * References to known CVEs in component demonstrations
  * Dependency information exposed through API responses

**Attack Vectors:**

  * Exploit known CVE references in package listings
  * Use outdated component vulnerabilities
  * Chain component vulnerabilities with other attacks

-----

### A07:2021 – Authentication & Identification Failures 👤

> 👉 **Description**: Previously "Broken Authentication", this covers weaknesses in authentication, session management, and identification.

**Implementation Details:**

  * Timing attacks in login endpoint (75-100ms delay for valid users)
  * Weak password requirements (minimum 6 characters)
  * Username enumeration via response timing
  * JWT tokens with weak secrets and long expiration

**Attack Vectors:**

  * Time-based username enumeration
  * Brute force attacks on weak passwords
  * JWT token manipulation and forgery
  * Session fixation and hijacking

-----

### A08:2021 – Software & Data Integrity Failures 💾

> 👉 **Description**: A new category for issues related to code and infrastructure that lack integrity protection, allowing malicious changes.

**Implementation Details:**

  * Client-side data validation without server-side verification
  * Unsigned code updates and dependency management
  * Data integrity checks bypassed in business logic

**Attack Vectors:**

  * Modify client-side validation
  * Inject malicious data through bypassed integrity checks
  * Exploit unsigned update mechanisms

-----

### A09:2021 – Security Logging & Monitoring Failures 📊

> 👉 **Description**: Inadequate logging and monitoring, leading to delayed or undetected breaches.

**Implementation Details:**

  * Insufficient logging of security events
  * Sensitive information included in log files
  * No alerting for suspicious activities
  * Log files accessible through path traversal

**Attack Vectors:**

  * Avoid detection through poor logging
  * Extract sensitive data from accessible logs
  * Exploit lack of monitoring for persistent access

-----

### A10:2021 – Server-Side Request Forgery (SSRF) 🌐

> 👉 **Description**: Applications fetching a remote resource without validating the user-supplied URL.

**Implementation Details:**

  * `/api/ssrf/fetch` endpoint accepts arbitrary URLs
  * Insufficient URL validation (bypasses common filters)
  * Internal network access through application server

**Attack Vectors:**

  * Access internal services via `127.1`, `2130706433`
  * File system access through `file://` protocol
  * Internal network reconnaissance through SSRF

\<br\>

-----

## 7\. DEVELOPMENT GUIDELINES 🧑‍💻

### **Environment Setup:**

1.  **Clone repository**: `git clone [repository-url]`
2.  **Install dependencies**: `npm install`
3.  **Copy environment**: `cp .env.example .env.local`
4.  **Configure databases** in `.env.local`
5.  **Initialize databases**: `npm run db:setup`
6.  **Run development server**: `npm run dev`

### **Project Structure:**

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth route group
│   ├── api/              # API route handlers
│   ├── vulnerabilities/  # Vulnerability pages
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/               # ShadCN UI components
│   └── vulnerabilities/  # Vulnerability demos
├── lib/                  # Utility libraries
│   ├── db.ts             # Database abstraction
│   ├── auth.ts           # Authentication utilities
│   └── vulnerabilities.ts # Vulnerability definitions
└── hooks/                # Custom React hooks
```

### **Coding Standards:**

  * **TypeScript** for type safety with intentional `any` usage for vulnerabilities
  * **ESLint and Prettier** for code formatting
  * **Tailwind CSS** for styling consistency
  * Component composition over inheritance
  * Explicit vulnerability marking with comments

### **Adding New Vulnerabilities:**

1.  Define vulnerability in `src/lib/vulnerabilities.ts`
2.  Create demo component in `src/components/vulnerabilities/`
3.  Add API endpoint in `src/app/api/` if needed
4.  Implement proper and improper versions for comparison
5.  Add flag submission logic
6.  Update progress tracking

\<br\>

-----

## 8\. TESTING ✅

### **Test Structure:**

  * **Jest** for unit testing
  * **Playwright** for end-to-end testing
  * Custom vulnerability validation scripts

### **Running Tests:**

```bash
npm test            # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:vulns  # Vulnerability validation
npm run test:db     # Database connection tests
```

### **Vulnerability Validation:**

  * `scripts/vulnerability-tests.js` - Validates implementation
  * `scripts/endpoint-tests.js` - API endpoint validation
  * `scripts/database-connection-test.js` - Database connectivity

### **Performance Testing:**

  * Load testing for timing attack demonstrations
  * Stress testing for denial-of-service scenarios
  * Memory usage monitoring for injection attacks

\<br\>

-----

## 9\. SECURITY CONSIDERATIONS ⚠️

**This application is intentionally vulnerable and must never be deployed to production.**

### **Isolation Requirements:**

  * Deploy only on isolated networks
  * Use virtual machines or containers
  * Implement proper network segmentation
  * Monitor for lateral movement

### **Data Protection:**

  * Use synthetic data only
  * No real user information
  * Regular data cleanup
  * Secure disposal of training environments

### **Monitoring:**

  * Log all training activities
  * Monitor for actual malicious usage
  * Alert on suspicious patterns
  * Regular security assessments of training infrastructure

### **Legal Considerations:**

  * Obtain proper authorization before use
  * Follow organizational security policies
  * Comply with local cybersecurity laws
  * Document training activities appropriately

> **Remember**: This application contains real vulnerabilities for educational purposes. Treat it as you would any vulnerable system in your environment.

```
```
