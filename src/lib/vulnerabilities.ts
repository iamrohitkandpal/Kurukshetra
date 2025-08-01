import { ShieldOff, KeyRound, DatabaseZap, LockKeyhole, ServerCog, History, FileText, Network, DraftingCompass, Recycle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Vulnerability {
  slug: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  icon: LucideIcon;
  details: {
    overview: string;
    demonstration: React.ReactNode | string;
    mitigation: string;
    codeExamples: {
      insecure: string;
      secure: string;
    };
    flag: string;
    hint?: string;
  };
}

export const vulnerabilities: Vulnerability[] = [
  {
    slug: 'insecure-auth',
    title: 'A07: Identification and Authentication Failures',
    description: 'Advanced authentication bypass with weak bcrypt rounds, JWT manipulation, and timing attacks.',
    severity: 'Critical',
    icon: ShieldOff,
    details: {
      overview:
        "Advanced Authentication Failures exploit sophisticated weaknesses in modern authentication systems. These include weak bcrypt cost factors that enable rapid password cracking, JWT algorithm confusion attacks (RS256 to HS256 downgrade), timing-based user enumeration through database query optimization differences, session fixation via predictable tokens, and second-order authentication bypasses through race conditions in multi-step authentication flows.",
      demonstration: "TOUGHER AUTHENTICATION EXPLOITATION:\n\n🚨 EXPERT-LEVEL CHALLENGE - Advanced Techniques Required\n\nThis authentication system implements industry-standard security measures with subtle but critical flaws. Expert-level exploitation techniques are required.\n\n🎯 ADVANCED ATTACK VECTORS:\n\n1. WEAK BCRYPT COST FACTOR EXPLOITATION:\n   - Password hashes use bcrypt rounds=4 (instead of 12+)\n   - Enables rapid offline brute-force attacks\n   - Hash extraction via blind SQL injection\n   - Rainbow tables for common passwords\n\n2. JWT ALGORITHM CONFUSION ATTACK:\n   - RS256 public key verification bypass\n   - HS256 algorithm downgrade exploitation\n   - Key confusion between asymmetric and symmetric\n   - Forge admin tokens using public key as HMAC secret\n\n3. TIMING-BASED USER ENUMERATION:\n   - Database query optimization reveals valid usernames\n   - Bcrypt timing differences for existing vs non-existing users\n   - Statistical analysis of response times\n   - Automated timing attack tooling\n\n4. SESSION RACE CONDITIONS:\n   - Concurrent authentication requests\n   - Token generation timing windows\n   - Multi-threaded session fixation\n   - Session state manipulation\n\n💀 HARDCORE EXPLOITATION TECHNIQUES:\n- Requires understanding of cryptographic primitives\n- Statistical timing analysis over multiple requests\n- JWT library vulnerability research\n- Custom tooling for race condition exploitation\n\n⚠️ NO HINTS PROVIDED - Real penetration testing skills required!",
      mitigation:
        "DEFENSE STRATEGIES:\n\n1. PASSWORD SECURITY:\n   - Use Argon2, bcrypt, or PBKDF2 for password hashing\n   - Implement salt + pepper for additional security\n   - Enforce strong password policies\n\n2. SESSION MANAGEMENT:\n   - Use cryptographically secure session tokens\n   - Implement proper session timeout\n   - Regenerate session IDs after authentication\n\n3. MULTI-FACTOR AUTHENTICATION:\n   - Implement TOTP or SMS-based 2FA\n   - Use hardware security keys for high-value accounts\n\n4. MONITORING & DETECTION:\n   - Log failed authentication attempts\n   - Implement account lockout policies\n   - Monitor for credential stuffing attacks",
      codeExamples: {
        insecure: `// VULNERABLE CODE - Multiple Issues
class AuthController {
  async login(email, password) {
    // Issue 1: Plaintext password storage
    const user = await db.query(
      'SELECT * FROM users WHERE email = ? AND password = ?', 
      [email, password]
    );
    
    if (user) {
      // Issue 2: Weak JWT secret
      const token = jwt.sign({id: user.id}, 'secret123');
      
      // Issue 3: No session timeout
      return { token, expiresIn: 'never' };
    }
    
    // Issue 4: Information disclosure
    throw new Error('Invalid email or password');
  }
}`,
        secure: `// SECURE IMPLEMENTATION
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

class SecureAuthController {
  constructor() {
    this.loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // limit each IP to 5 requests per windowMs
    });
  }
  
  async register(email, password) {
    // Strong password hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );
  }
  
  async login(email, password) {
    try {
      const user = await db.query(
        'SELECT id, email, password_hash FROM users WHERE email = ?', 
        [email]
      );
      
      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        // Constant-time response to prevent enumeration
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Invalid credentials');
      }
      
      // Secure JWT with strong secret and expiration
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET, // 256-bit random secret
        { expiresIn: '1h' }
      );
      
      // Log successful authentication
      this.logAuthEvent(user.id, 'LOGIN_SUCCESS');
      
      return { token, expiresIn: 3600 };
    } catch (error) {
      this.logAuthEvent(email, 'LOGIN_FAILED');
      throw error;
    }
  }
}`,
      },
      flag: 'FLAG{4dv4nc3d_4uth_3xpl01t4t10n_M4st3r}',
      hint: 'Multiple attack vectors: 1) Weak bcrypt rounds enable offline cracking 2) JWT algorithm confusion (check the algorithm) 3) Timing attacks on user enumeration 4) Race conditions in session management. Combine techniques for maximum impact.'
    },
  },
  {
    slug: 'access-control-flaws',
    title: 'A01: Broken Access Control',
    description: 'Test horizontal/vertical privilege escalation, forced browsing, and IDOR (Insecure Direct Object References).',
    severity: 'Critical',
    icon: KeyRound,
    details: {
      overview: "Broken Access Control represents the most critical vulnerability class affecting modern web applications. These flaws emerge when applications fail to properly enforce authorization policies, creating pathways for attackers to access resources, data, or functionality beyond their intended scope. Advanced threat actors exploit these weaknesses through sophisticated techniques including horizontal privilege escalation (accessing peer user accounts), vertical privilege escalation (gaining administrative rights), Insecure Direct Object References (IDOR), forced browsing attacks, and permission boundary bypasses. The complexity increases when applications implement role-based access control (RBAC) or attribute-based access control (ABAC) systems incorrectly, creating subtle authorization gaps that require methodical testing to discover.",
      demonstration: "ACCESS CONTROL SECURITY ASSESSMENT:\n\n🛡️ INTERMEDIATE CHALLENGE - Authorization Testing Required\n\nThis application implements multiple layers of access control that mirror real-world enterprise applications. Your mission is to systematically identify and exploit authorization weaknesses across different user contexts and API endpoints.\n\n🎯 COMPREHENSIVE TESTING METHODOLOGY:\n\n1. AUTHENTICATION CONTEXT ANALYSIS:\n   - Test with multiple user accounts (admin, manager, employee)\n   - Understand role hierarchies and permission boundaries\n   - Analyze JWT tokens for role and permission claims\n   - Map user privileges across different application areas\n\n2. HORIZONTAL PRIVILEGE ESCALATION:\n   - Attempt cross-user data access using different user IDs\n   - Test API endpoints with manipulated user identifiers\n   - Exploit IDOR vulnerabilities in REST API paths\n   - Verify session tokens cannot access other user contexts\n\n3. VERTICAL PRIVILEGE ESCALATION:\n   - Identify administrative functions and interfaces\n   - Test role-based access control bypass techniques\n   - Attempt privilege escalation through parameter manipulation\n   - Exploit client-side role validation weaknesses\n\n4. RESOURCE-LEVEL AUTHORIZATION:\n   - Test object-level permissions for documents, files, records\n   - Attempt direct object reference manipulation\n   - Check for missing authorization on CRUD operations\n   - Verify proper resource ownership validation\n\n5. API SECURITY ASSESSMENT:\n   - Enumerate hidden or undocumented API endpoints\n   - Test HTTP methods (GET, POST, PUT, DELETE) on restricted resources\n   - Attempt access control bypass through HTTP verb tampering\n   - Check for inconsistent authorization between UI and API\n\n💡 STRATEGIC RESEARCH HINTS:\n- Admin panels often have client-side restrictions only\n- API endpoints might have different authorization than web UI\n- User enumeration can reveal account privilege levels\n- Session tokens sometimes contain modifiable role information\n- HTTP headers might influence authorization decisions\n- Database queries could be exploitable through parameter manipulation\n\n⚡ ADVANCED TECHNIQUES:\n- Parameter pollution for authorization bypass\n- HTTP request smuggling for access control evasion\n- Race conditions in permission checks\n- Time-of-check-time-of-use (TOCTOU) vulnerabilities\n\n🔍 RECONNAISSANCE APPROACH:\n1. Map all application endpoints and functionality\n2. Create accounts with different privilege levels\n3. Document expected vs actual authorization behavior\n4. Test boundary conditions and edge cases systematically\n5. Combine multiple techniques for maximum impact",
      mitigation:
        "COMPREHENSIVE ACCESS CONTROL DEFENSE:\n\n1. IMPLEMENT RBAC (Role-Based Access Control):\n   - Define clear roles and permissions\n   - Enforce principle of least privilege\n   - Use centralized authorization logic\n\n2. SERVER-SIDE VALIDATION:\n   - Never rely on client-side access controls\n   - Validate permissions on every request\n   - Use middleware for consistent enforcement\n\n3. OBJECT-LEVEL AUTHORIZATION:\n   - Validate user owns the requested resource\n   - Use UUIDs instead of sequential IDs\n   - Implement resource-level permissions\n\n4. SESSION MANAGEMENT:\n   - Invalidate sessions on privilege changes\n   - Implement session timeout\n   - Use secure session storage\n\n5. MONITORING & AUDITING:\n   - Log all access control failures\n   - Monitor for privilege escalation attempts\n   - Implement real-time alerting",
      codeExamples: {
        insecure: `// CRITICAL VULNERABILITIES - Multiple Issues
class VulnerableUserController {
  // Issue 1: No authorization check
  async getUser(req, res) {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user); // Anyone can access any user!
  }
  
  // Issue 2: Client-side role check only
  async deleteAllUsers(req, res) {
    // Frontend hides this button for non-admins
    // but no server-side validation!
    await User.deleteMany({});
    res.json({ message: 'All users deleted' });
  }
  
  // Issue 3: Predictable IDs enable enumeration
  async getUserBySequentialId(req, res) {
    const { id } = req.params; // 1, 2, 3, 4...
    const user = await User.findOne({ id: parseInt(id) });
    res.json(user);
  }
}`,
        secure: `// SECURE IMPLEMENTATION
class SecureUserController {
  constructor() {
    this.authorize = this.authorize.bind(this);
  }
  
  // Centralized authorization middleware
  authorize(requiredRole = null, resourceOwnership = false) {
    return async (req, res, next) => {
      try {
        // Verify user is authenticated
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Check role-based access
        if (requiredRole && req.user.role !== requiredRole) {
          this.logAccessViolation(req.user.id, requiredRole, req.path);
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        // Check resource ownership
        if (resourceOwnership) {
          const resourceId = req.params.id;
          if (req.user.id !== resourceId && req.user.role !== 'admin') {
            this.logAccessViolation(req.user.id, 'ownership', req.path);
            return res.status(403).json({ error: 'Access denied' });
          }
        }
        
        next();
      } catch (error) {
        res.status(500).json({ error: 'Authorization failed' });
      }
    };
  }
  
  // Secure user retrieval with ownership check
  async getUser(req, res) {
    const { id } = req.params;
    
    // Only allow users to access their own data
    // unless they're an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  }
  
  // Admin-only function with proper validation
  async deleteAllUsers(req, res) {
    // Server-side role validation
    if (req.user.role !== 'admin') {
      this.logAccessViolation(req.user.id, 'admin', 'deleteAllUsers');
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Additional confirmation required
    if (!req.body.confirmToken || req.body.confirmToken !== 'DELETE_ALL') {
      return res.status(400).json({ error: 'Confirmation required' });
    }
    
    await User.deleteMany({ role: { $ne: 'admin' } }); // Don't delete admins
    this.logAdminAction(req.user.id, 'deleted_all_users');
    
    res.json({ message: 'Users deleted successfully' });
  }
}

// Express route setup with middleware
app.get('/api/users/:id', 
  authenticateToken, 
  userController.authorize(null, true), 
  userController.getUser
);

app.delete('/api/admin/users', 
  authenticateToken, 
  userController.authorize('admin'), 
  userController.deleteAllUsers
);`,
      },
      flag: 'FLAG{H0r1z0nt4l_V3rt1c4l_IDORs_PWN3D}',
      hint: 'Look for: 1) Admin panels with client-side restrictions only 2) API endpoints with different authorization than UI 3) User ID manipulation in requests 4) HTTP method tampering for privilege escalation 5) Session tokens containing modifiable role claims. Check /api/admin/* endpoints!'
    },
  },
  {
    slug: 'injection-vulnerabilities',
    title: 'A03: Injection Vulnerabilities',
    description: 'Advanced blind SQLi, second-order injection, NoSQL injection, and UNION-based database enumeration techniques.',
    severity: 'High',
    icon: DatabaseZap,
    details: {
      overview: "Injection vulnerabilities represent one of the most prevalent and dangerous attack vectors in modern web applications. These flaws emerge when untrusted user input is passed directly to interpreters (SQL, NoSQL, LDAP, OS commands, etc.) without proper validation or sanitization. Advanced persistent threat actors leverage sophisticated injection techniques including Union-based SQL injection, blind boolean-based injection, time-based blind attacks, second-order injection, and NoSQL injection to achieve complete database compromise, authentication bypass, privilege escalation, and remote code execution. The complexity of modern injection attacks often requires chaining multiple techniques and deep understanding of database internals, making these vulnerabilities particularly dangerous in skilled adversaries' hands.",
      demonstration: "ADVANCED SQL INJECTION EXPLOITATION:\n\n🚨 EXPERT-LEVEL CHALLENGE - No Training Wheels!\n\nThe search functionality below contains a sophisticated injection vulnerability that requires multiple techniques to fully exploit. This is not your typical basic SQLi challenge.\n\n🎯 EXPLOITATION OBJECTIVES:\n\n1. DATABASE RECONNAISSANCE:\n   - Map the complete database schema using information_schema\n   - Enumerate all tables, columns, and relationships\n   - Identify hidden tables containing sensitive data\n   - Discover database version and configuration details\n\n2. ADVANCED INJECTION TECHNIQUES:\n   - Master UNION-based injection with column count discovery\n   - Exploit blind boolean-based injection for data extraction\n   - Use time-based blind injection for confirmation\n   - Combine multiple injection vectors for maximum impact\n\n3. DATA EXFILTRATION:\n   - Extract complete user database including password hashes\n   - Locate and retrieve administrative credentials\n   - Find hidden flags stored in unexpected table structures\n   - Export sensitive configuration data\n\n⚠️ REAL-WORLD COMPLEXITY:\n- The injection point requires precise SQL syntax understanding\n- Error messages are suppressed - rely on blind techniques\n- Multiple encoding layers may be present\n- Database uses non-standard table structures\n- Success requires chaining multiple payloads\n\n💡 SUBTLE HINTS (for intermediate hackers):\n- Pay attention to SQL comment syntax variations\n- Different databases handle UNION operations differently\n- Information_schema is your reconnaissance friend\n- Boolean conditions can reveal data one bit at a time\n- Time delays can confirm successful injection\n\nNO DIRECT SOLUTIONS PROVIDED - Research and experiment!",
      mitigation:
        "COMPREHENSIVE INJECTION DEFENSE STRATEGY:\n\n1. PARAMETERIZED QUERIES (Primary Defense):\n   - Always use prepared statements/parameterized queries\n   - Never concatenate user input directly into SQL strings\n   - Use ORM frameworks with built-in parameterization\n   - Validate that ORM methods are used correctly\n\n2. INPUT VALIDATION \u0026 SANITIZATION:\n   - Implement server-side input validation for all parameters\n   - Use allow-lists rather than deny-lists for validation\n   - Validate data types, lengths, and patterns\n   - Sanitize special characters based on context\n\n3. PRINCIPLE OF LEAST PRIVILEGE:\n   - Use database accounts with minimal required permissions\n   - Separate read and write database connections\n   - Implement role-based database access control\n   - Regularly audit database permissions\n\n4. WEB APPLICATION FIREWALL (WAF):\n   - Deploy ModSecurity or similar WAF solutions\n   - Configure custom rules for injection detection\n   - Monitor and block suspicious query patterns\n   - Implement rate limiting on data-intensive endpoints\n\n5. ADVANCED PROTECTION:\n   - Use stored procedures with parameter validation\n   - Implement database activity monitoring\n   - Regular security testing including SQLi automation\n   - Code review focusing on data access layers",
      codeExamples: {
        insecure: `// CRITICAL SQL INJECTION VULNERABILITIES
// Issue 1: Direct string concatenation
class VulnerableUserSearch {
  async searchUsers(searchTerm, category) {
    // Highly vulnerable - multiple injection points
    const query = \`
      SELECT u.id, u.name, u.email, p.role 
      FROM users u 
      JOIN profiles p ON u.id = p.user_id 
      WHERE u.name LIKE '%\${searchTerm}%' 
      AND p.category = '\${category}' 
      ORDER BY u.created_at DESC
    \`;
    
    return await db.query(query);
    // Attackers can inject: ' UNION SELECT 1,username,password,4 FROM admin_users--
  }
  
  // Issue 2: Dynamic table names
  async getDataFromTable(tableName, userId) {
    const query = \`SELECT * FROM \${tableName} WHERE user_id = \${userId}\`;
    return await db.query(query);
    // Allows access to any table: users; DROP TABLE users--
  }
  
  // Issue 3: NoSQL injection
  async findUser(userFilter) {
    // MongoDB injection vulnerability
    return await User.find(userFilter);
    // Vulnerable to: {\"$where\": \"this.password.match(/.*/)\"}
  }
}`,
        secure: `// SECURE IMPLEMENTATION WITH MULTIPLE DEFENSE LAYERS
import validator from 'validator';
import rateLimit from 'express-rate-limit';

class SecureUserSearch {
  constructor() {
    // Rate limiting for data-intensive operations
    this.searchLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 requests per windowMs
      message: 'Too many search requests'
    });
    
    // Allowed table names (whitelist approach)
    this.allowedTables = new Set([
      'users', 'profiles', 'posts', 'comments'
    ]);
  }
  
  // Secure parameterized query
  async searchUsers(searchTerm, category) {
    try {
      // Input validation
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new Error('Invalid search term');
      }
      
      if (!category || !['business', 'personal', 'admin'].includes(category)) {
        throw new Error('Invalid category');
      }
      
      // Length and content validation
      if (searchTerm.length > 50) {
        throw new Error('Search term too long');
      }
      
      // Parameterized query - injection impossible
      const query = \`
        SELECT u.id, u.name, u.email, p.role 
        FROM users u 
        INNER JOIN profiles p ON u.id = p.user_id 
        WHERE u.name LIKE ? 
        AND p.category = ? 
        ORDER BY u.created_at DESC 
        LIMIT 50
      \`;
      
      const searchPattern = \`%\${searchTerm}%\`;
      
      // Using parameterized query with bind variables
      const results = await db.query(query, [searchPattern, category]);
      
      // Log search activity for monitoring
      this.logSearchActivity(searchTerm, category, results.length);
      
      return results;
      
    } catch (error) {
      this.logSecurityEvent('search_error', { searchTerm, category, error: error.message });
      throw new Error('Search failed - invalid parameters');
    }
  }
  
  // Secure dynamic table access
  async getDataFromTable(tableName, userId) {
    // Strict whitelist validation
    if (!this.allowedTables.has(tableName)) {
      this.logSecurityEvent('unauthorized_table_access', { tableName, userId });
      throw new Error('Unauthorized table access');
    }
    
    // Validate user ID is numeric
    if (!Number.isInteger(parseInt(userId)) || userId < 1) {
      throw new Error('Invalid user ID');
    }
    
    // Use template with strict table name validation
    // Note: Table names cannot be parameterized, so we use whitelist
    const allowedQueries = {
      users: 'SELECT id, name, email FROM users WHERE id = ?',
      profiles: 'SELECT user_id, bio, avatar FROM profiles WHERE user_id = ?',
      posts: 'SELECT id, title, content FROM posts WHERE author_id = ?',
      comments: 'SELECT id, post_id, content FROM comments WHERE author_id = ?'
    };
    
    const query = allowedQueries[tableName];
    return await db.query(query, [parseInt(userId)]);
  }
  
  // Secure MongoDB query
  async findUser(username, email) {
    // Strict input validation
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!validator.isAlphanumeric(username.replace(/_/g, ''))) {
      throw new Error('Invalid username format');
    }
    
    // Secure query with explicit field matching
    const query = {
      username: { $eq: username }, // Exact match only
      email: { $eq: email },       // Exact match only
      active: { $eq: true }        // Additional security constraint
    };
    
    // Only return safe fields
    const projection = { username: 1, email: 1, created_at: 1, _id: 0 };
    
    return await User.findOne(query, projection);
  }
  
  // Security monitoring
  logSecurityEvent(eventType, details) {
    console.warn(\`[SECURITY] \${eventType}:\`, {
      timestamp: new Date().toISOString(),
      ...details,
      ip: this.req?.ip || 'unknown'
    });
  }
}

// Express middleware setup
app.get('/api/search/users', 
  authenticateToken,
  userSearch.searchLimiter,
  async (req, res) => {
    try {
      const { q: searchTerm, category } = req.query;
      const results = await userSearch.searchUsers(searchTerm, category);
      res.json({ results, count: results.length });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);`,
      },
      flag: 'FLAG{UN10N_S3L3CT_1nf0rm4t10n_sch3m4_PWN}',
      hint: 'Advanced techniques required: 1) UNION injection to enumerate database schema 2) Blind boolean-based injection for data extraction 3) NoSQL injection with $where clauses 4) Second-order injection through stored data 5) Error-based information disclosure. Try the search functionality with complex payloads!'
    },
  },
  {
    slug: 'insecure-design',
    title: 'Insecure Design',
    description: 'Flaws in business logic or architecture that can be exploited by malicious users.',
    severity: 'High',
    icon: DraftingCompass,
    details: {
        overview: "Insecure Design is a broad category representing flaws in business logic. Unlike a bug in implementation, this is a flaw in the design itself. For example, a password reset flow that doesn't properly validate user identity.",
        demonstration: "This is a conceptual challenge. The flag is a reward for understanding that security must be a consideration from the very beginning of the development lifecycle, not something bolted on at the end. The best defense is a good design.",
        mitigation: "Integrate security into every phase of the development lifecycle (Threat Modeling). Use security design patterns and principles like 'Defense in Depth' and 'Principle of Least Privilege' from the start.",
        codeExamples: {
            insecure: `// Insecure logic:
// A password reset function that only asks for an email.
// An attacker could reset anyone's password.
function requestPasswordReset(email) {
  // immediately sends reset link
}`,
            secure: `// Secure logic:
// A password reset function that requires answering a security question
// or sending a code to a verified phone number.
function requestPasswordReset(email, securityAnswer) {
  if(verifySecurityQuestion(email, securityAnswer)) {
    // send reset link
  }
}`
        },
        flag: 'FLAG{S3cur1ty_By_D3s1gn_M4tt3rs}',
    }
  },
  {
    slug: 'crypto-weakness',
    title: 'Cryptographic Failures',
    description: 'Use of weak, outdated, or improper encryption keys and methods to protect sensitive data.',
    severity: 'High',
    icon: LockKeyhole,
    details: {
      overview: "Cryptographic failures encompass a wide range of vulnerabilities involving weak encryption, improper key management, and inadequate protection of sensitive data. Modern attacks exploit weak random number generation, insecure hash functions, predictable encryption keys, improper certificate validation, and side-channel timing attacks. Sophisticated attackers combine cryptanalysis with implementation flaws to bypass encryption entirely or recover sensitive cryptographic material.",
      demonstration: "ADVANCED CRYPTOGRAPHIC EXPLOITATION CHALLENGE:\n\n🔐 HARDCORE CRYPTOGRAPHY ASSESSMENT - Multiple Attack Vectors\n\nThis challenge involves several cryptographic weaknesses commonly found in production applications. You'll need to apply both theoretical knowledge and practical exploitation techniques.\n\n🎯 CRYPTOGRAPHIC ATTACK OBJECTIVES:\n\n1. WEAK ENCODING DETECTION:\n   - Identify encoding schemes masquerading as encryption\n   - Decode Base64 encoded 'secrets' that aren't actually encrypted\n   - Understand the difference between encoding and encryption\n\n2. HASH FUNCTION EXPLOITATION:\n   - Analyze weak hashing algorithms (MD5, SHA1)\n   - Perform rainbow table attacks on unsalted hashes\n   - Exploit hash length extension attacks\n   - Crack password hashes using dictionary attacks\n\n3. SYMMETRIC ENCRYPTION WEAKNESSES:\n   - Identify hardcoded encryption keys\n   - Exploit ECB mode patterns in encrypted data\n   - Perform known-plaintext attacks\n   - Abuse predictable initialization vectors (IVs)\n\n4. KEY MANAGEMENT FAILURES:\n   - Extract keys from client-side JavaScript\n   - Exploit weak key derivation functions\n   - Abuse key reuse across multiple contexts\n   - Identify keys stored in environment variables\n\n⚡ ADVANCED TECHNIQUES REQUIRED:\n- Statistical analysis of encrypted data\n- Timing attack exploitation\n- Cryptographic oracle attacks\n- Side-channel information leakage\n\n💡 SUBTLE CRYPTOGRAPHIC HINTS:\n- Not all 'encryption' actually encrypts data\n- Observe patterns in supposedly random data\n- Check JavaScript sources for hardcoded secrets\n- Base64 strings might hide more than expected\n- Consider what happens when the same plaintext is encrypted multiple times\n\n⚠️ NO SPOON-FEEDING: Research cryptographic attacks yourself!\n\nThe flag is encoded (not encrypted) in: RkxBR3tCNDE1ZV82NF9JU19OT1RfRU5DUllQVElPTn0=",
      mitigation:
        "Encrypt all sensitive data at rest and in transit using strong, standard algorithms like AES-256. Use secure protocols like TLS 1.3. Manage cryptographic keys securely, including rotation and access control.",
      codeExamples: {
        insecure: `// Insecure: Using Base64 as "encryption"
function "encrypt"(data) {
  return Buffer.from(data).toString('base64');
}
// This is easily reversible!`,
        secure: `// Secure: Using a strong encryption library
import crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
 let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}`,
      },
      flag: 'FLAG{B45e_64_IS_NOT_ENCRYPTION}',
    },
  },
  {
    slug: 'misconfiguration',
    title: 'Security Misconfiguration',
    description: 'Default settings, verbose error messages, or exposed cloud storage buckets can lead to compromise.',
    severity: 'Medium',
    icon: ServerCog,
    details: {
      overview: "Security misconfiguration represents a critical attack surface encompassing default credentials, unnecessary services, verbose error messages, unpatched systems, and exposed administrative interfaces. Sophisticated attackers systematically enumerate misconfigurations across multiple layers including web servers, databases, cloud services, and application frameworks. Modern attacks exploit configuration drift, exposed debug endpoints, overprivileged service accounts, and insecure default settings to achieve initial access and privilege escalation.",
      demonstration: "ADVANCED MISCONFIGURATION EXPLOITATION:\n\n⚠️ INFRASTRUCTURE SECURITY ASSESSMENT - Multiple Discovery Techniques\n\n🎯 CONFIGURATION HUNTING OBJECTIVES:\n\n1. ENVIRONMENT VARIABLE EXPOSURE:\n   - Browser console reveals leaked API keys and secrets\n   - Next.js NEXT_PUBLIC_ variables expose sensitive data\n   - Source code inspection reveals hardcoded credentials\n   - Network requests expose internal API endpoints\n\n2. DEBUG MODE EXPLOITATION:\n   - Stack traces reveal internal application structure\n   - Error messages disclose database schemas\n   - Debug endpoints expose application internals\n   - Verbose logging reveals user enumeration data\n\n3. DEFAULT CONFIGURATION ABUSE:\n   - Administrative interfaces with default passwords\n   - Unnecessary services running with weak authentication\n   - Cloud storage buckets with public read/write access\n   - Database connections with default credentials\n\n4. CLOUD METADATA EXPLOITATION:\n   - AWS, GCP, Azure metadata service enumeration\n   - Instance metadata reveals access tokens\n   - Service account credentials extraction\n   - Container orchestration secrets exposure\n\n⚡ RECONNAISSANCE TECHNIQUES:\n- Browser developer tools for secret discovery\n- Directory brute-forcing for hidden endpoints\n- Version fingerprinting for known vulnerabilities\n- Configuration file enumeration\n- Error message analysis for information disclosure\n\n💡 STRATEGIC HINTS:\n- JavaScript console might contain surprising information\n- Environment variables tell interesting stories\n- Error pages often reveal too much detail\n- Source maps can expose server-side logic\n- HTTP headers reveal technology stacks\n\n🔍 METHODOLOGY: Use tools like Nmap, Burp Suite, OWASP ZAP, and custom scripts for comprehensive misconfiguration discovery.",
      mitigation:
        "COMPREHENSIVE CONFIGURATION SECURITY:\n\n1. ENVIRONMENT MANAGEMENT:\n   - Never expose secrets in client-side code\n   - Use proper secret management systems (HashiCorp Vault, AWS Secrets Manager)\n   - Implement environment-specific configurations\n   - Regular security configuration audits\n\n2. ERROR HANDLING:\n   - Generic error messages for production\n   - Structured logging for security events\n   - Error monitoring without information disclosure\n   - Custom error pages that don't reveal stack traces\n\n3. SERVICE HARDENING:\n   - Disable unnecessary services and features\n   - Change all default passwords and configurations\n   - Implement least-privilege access controls\n   - Regular security patches and updates\n\n4. MONITORING \u0026 DETECTION:\n   - Configuration drift detection\n   - Automated vulnerability scanning\n   - Cloud security posture management\n   - Real-time misconfiguration alerting",
      codeExamples: {
        insecure: `// Insecure: Exposing a secret key to the client
// in .env.local
NEXT_PUBLIC_API_KEY="super_secret_key_12345"`,
        secure: `// Secure: Keeping secret key on the server
// in .env.local
SERVER_API_KEY="super_secret_key_12345"
// This is not prefixed with NEXT_PUBLIC_ and is not sent to the browser.`,
      },
      flag: 'FLAG{3xp0s3d_3nv_v4r_m1sc0nf1g}',
    },
  },
  {
    slug: 'vulnerable-dependencies',
    title: 'Vulnerable Components',
    description: 'Using libraries or frameworks with known security flaws can expose the entire application.',
    severity: 'Medium',
    icon: History,
    details: {
      overview: "Modern applications are built using a vast number of open-source libraries and components. If a component has a known vulnerability, the application that uses it is also vulnerable. Staying on top of dependencies is crucial.",
      demonstration: "The table below shows a simulated list of dependencies used in this project, with some marked as having known vulnerabilities. This highlights the importance of regularly scanning and updating packages.",
      mitigation:
        "Regularly scan for vulnerable dependencies using tools like `npm audit`, Snyk, or Dependabot. Remove unused dependencies. Ensure you are getting components from official sources over secure links.",
      codeExamples: {
        insecure: `// package.json with an old, vulnerable library
{
  "dependencies": {
    "lodash": "4.17.15" // A version with known prototype pollution vulnerability
  }
}`,
        secure: `// package.json with the library updated
{
  "dependencies": {
    "lodash": "4.17.21" // Patched version
  }
}`,
      },
      flag: 'FLAG{CVE-2022-24999-exploited!}',
    },
  },
  {
    slug: 'data-integrity-failures',
    title: 'Software & Data Integrity',
    description: 'Failures related to insecure deserialization or data integrity assumptions.',
    severity: 'High',
    icon: Recycle,
    details: {
      overview: "Software and Data Integrity Failures relate to code and infrastructure that does not protect against integrity violations. An example of this is when an application relies upon plugins, libraries, or modules from untrusted sources, repositories, and content delivery networks (CDNs). Insecure CI/CD pipelines can introduce the potential for unauthorized access, malicious code, or system compromise.",
      demonstration: "This is a conceptual challenge. Many applications fetch dependencies without verifying their integrity (e.g., using a lockfile or checksums). An attacker could perform a man-in-the-middle attack on an insecure CDN to inject malicious code. The flag here is a reward for understanding this risk.",
      mitigation:
        "Use digital signatures or similar mechanisms to verify that software or data is from the expected source and has not been altered. Ensure your CI/CD pipeline has proper segregation, configuration, and access control. Use dependency vulnerability scanners.",
      codeExamples: {
        insecure: `// Insecure: Loading a script from a CDN without integrity check
<script src="https://example.com/library.js"></script>
// If the CDN is compromised, malicious code can be injected.`,
        secure: `// Secure: Using Subresource Integrity (SRI)
<script src="https://example.com/library.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wN"
        crossorigin="anonymous"></script>
// The browser will not execute the script if the hash doesn't match.`,
      },
      flag: 'FLAG{D4t4_1nt3gr1ty_M4tt3rs!}',
    },
  },
   {
    slug: 'logging-failures',
    title: 'Security Logging & Monitoring',
    description: 'Lack of proper logging and monitoring makes breaches and suspicious activity hard to detect.',
    severity: 'Medium',
    icon: FileText,
    details: {
      overview: "Without sufficient logging and monitoring, it's nearly impossible to detect a breach, understand its scope, or perform forensic analysis. Attackers rely on this lack of monitoring to operate undetected for long periods.",
      demonstration: "This application intentionally has minimal logging. When you performed actions on other pages (like the failed login attempt), no security event was logged on the server. An attacker's actions would go unnoticed. For this challenge, the flag is hidden in plain sight, as a reward for reading about this important topic.",
      mitigation:
        "Log all login, access control, and server-side input validation failures with sufficient user context. Ensure logs are in a format that can be easily consumed by a centralized log management solution. Implement alerting for suspicious activities.",
      codeExamples: {
        insecure: `// Insecure: No logging on a critical failure
function login(username, password) {
  if (!isValid(username, password)) {
    // Just return an error, no log is created
    return "Invalid credentials";
  }
  // ...
}`,
        secure: `// Secure: Logging the security-relevant event
import logger from './logger';

function login(username, password) {
  if (!isValid(username, password)) {
    logger.warn({
      event: 'failed_login',
      username: username,
      ip_address: req.ip
    }, 'Failed login attempt');
    return "Invalid credentials";
  }
  // ...
}`,
      },
      flag: 'FLAG{L0gg1ng_1s_L0v3}',
    },
  },
  {
    slug: 'ssrf',
    title: 'Server-Side Request Forgery',
    description: 'Forcing a server to make requests to internal or external resources on an attacker\'s behalf.',
    severity: 'Critical',
    icon: Network,
    details: {
      overview: "Server-Side Request Forgery (SSRF) flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall, VPN, or another type of network access control list (ACL).",
        demonstration: "ADVANCED SSRF EXPLOITATION CHALLENGE:\n\n💀 EXPERT-LEVEL NETWORK PENETRATION TESTING\n\nThis SSRF vulnerability allows sophisticated internal network reconnaissance and data exfiltration. Multiple attack vectors are available for skilled adversaries.\n\n🎯 ADVANCED SSRF ATTACK OBJECTIVES:\n\n1. INTERNAL NETWORK RECONNAISSANCE:\n   - Enumerate internal services (HTTP, FTP, SSH, databases)\n   - Port scan internal networks (192.168.x.x, 10.x.x.x, 172.16-31.x.x)\n   - Identify internal web applications and APIs\n   - Discover cloud metadata services (AWS, GCP, Azure)\n\n2. PROTOCOL EXPLOITATION:\n   - file:// protocol for local file access\n   - gopher:// protocol for advanced TCP communication\n   - ftp:// protocol for internal FTP enumeration\n   - dict:// protocol for service fingerprinting\n\n3. CLOUD METADATA EXTRACTION:\n   - AWS: http://169.254.169.254/latest/meta-data/\n   - GCP: http://metadata.google.internal/computeMetadata/v1/\n   - Azure: http://169.254.169.254/metadata/instance\n\n4. BYPASS TECHNIQUES:\n   - URL encoding and double encoding\n   - DNS rebinding attacks\n   - IPv6 address notation\n   - Decimal/hexadecimal IP representation\n   - HTTP redirect chains\n\n💡 STRATEGIC EXPLOITATION PATHS:\n- Start with internal service discovery\n- Extract cloud credentials from metadata services\n- Read sensitive configuration files\n- Exploit internal services with default credentials\n- Chain SSRF with other vulnerabilities for maximum impact\n\n⚠️ NO BASIC EXAMPLES - Research advanced SSRF techniques yourself!",
      mitigation: "Implement an allow-list of permitted domains, protocols, and ports. Do not allow requests to internal, non-routable IP addresses. Disable unused URL schemas. Ensure that raw response bodies from server requests are not sent to the client.",
      codeExamples: {
        insecure: `// Insecure: Directly fetching a user-provided URL
app.get('/fetch-data', async (req, res) => {
    const { url } = req.query;
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
});`,
        secure: `// Secure: Validating against an allow-list
const ALLOWED_DOMAINS = ['api.example.com'];
app.get('/fetch-data', async (req, res) => {
    const { url } = req.query;
    const hostname = new URL(url).hostname;
    if (!ALLOWED_DOMAINS.includes(hostname)) {
        return res.status(400).send('Invalid domain');
    }
    //... fetch data
});`
      },
      flag: 'FLAG{1nt3rn4l_n3tw0rk_m3t4d4t4_3xtr4ct3d}',
      hint: 'Advanced SSRF exploitation: 1) Try cloud metadata endpoints 2) Use different protocols (file://, gopher://, dict://) 3) Internal network enumeration (192.168.x.x) 4) Bypass filters with URL encoding 5) Chain with other vulnerabilities. The SSRF endpoint is at /api/ssrf/fetch'
    }
  }
];
