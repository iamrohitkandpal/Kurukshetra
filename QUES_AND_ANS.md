# Kurukshetra - Interview Questions & Answers

## Technical Round Questions

### 1. Explain the architecture of your application
**Answer:** Kurukshetra follows a modern full-stack architecture with:
- Frontend: React.js with Context API for state management
- Backend: Node.js/Express.js REST API
- Databases: SQLite for primary storage, MongoDB for NoSQL examples
- Authentication: JWT-based with optional 2FA
- Security: Intentionally vulnerable implementations of OWASP Top 10

The application is containerized using Docker and follows a modular component-based structure for better maintainability and scalability.

### 2. What security vulnerabilities have you implemented and why?
**Answer:** I've implemented all OWASP Top 10 (2021) vulnerabilities:
1. Broken Access Control - To demonstrate IDOR, CSRF, and access control issues
2. Cryptographic Failures - Showing weak password storage and insecure communication
3. Injection - Including SQL, NoSQL, and Command injection points
4. Insecure Design - Demonstrating architectural security flaws
5. Security Misconfiguration - Showing common configuration mistakes

Each vulnerability is implemented with varying difficulty levels to support learning progression.

### 3. How did you handle state management in the frontend?
**Answer:** I used React's Context API for global authentication state and local component state for specific features. The choice was based on:
1. Simplicity of implementation
2. Built-in React feature requiring no additional dependencies
3. Sufficient for the application's needs without Redux complexity
4. Easy to maintain and understand

### 4. Explain your database schema design decisions
**Answer:** The database schema was designed to:
1. Support core features (users, products, feedback)
2. Demonstrate various security vulnerabilities
3. Maintain referential integrity where needed
4. Allow for future extensibility

Key tables include users, products, security_questions, and vulnerability_progress, with appropriate relationships and constraints.

### 5. How did you implement the authentication system?
**Answer:** The authentication system uses:
1. JWT for token-based authentication
2. Optional 2FA using TOTP
3. Password reset functionality
4. API key authentication for certain endpoints

It intentionally includes vulnerabilities like weak password storage and insecure token handling for educational purposes.

## HR Round Questions

### 1. What motivated you to create this project?
**Answer:** I created Kurukshetra to:
1. Provide a hands-on learning platform for security professionals
2. Help developers understand common security vulnerabilities
3. Create a safe environment for practicing security testing
4. Contribute to the cybersecurity education community

### 2. What challenges did you face during development?
**Answer:** Key challenges included:
1. Balancing security education with responsible disclosure
2. Creating realistic but controlled vulnerabilities
3. Managing multiple vulnerability implementations
4. Ensuring the application remains educational while being intentionally vulnerable

### 3. How do you stay updated with security trends?
**Answer:** I:
1. Follow security researchers and organizations
2. Participate in security communities
3. Read security blogs and publications
4. Attend security conferences and webinars
5. Practice on platforms like HackTheBox and TryHackMe

### 4. How would you explain this project to non-technical stakeholders?
**Answer:** Kurukshetra is like a flight simulator for cybersecurity professionals. Just as pilots practice in simulators before flying real planes, security professionals can practice finding and fixing security issues in this controlled environment without risking real systems.

### 5. Where do you see this project going in the future?
**Answer:** Future plans include:
1. Adding new vulnerability types as they emerge
2. Implementing different difficulty levels
3. Adding guided learning paths
4. Creating detailed documentation and tutorials
5. Building a community around security education

### 6. How do you handle feedback and contributions?
**Answer:** I:
1. Welcome community contributions through pull requests
2. Maintain clear contribution guidelines
3. Review and implement valuable suggestions
4. Actively engage with users and contributors
5. Regularly update documentation based on feedback