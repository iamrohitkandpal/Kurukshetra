# Kurukshetra - Cybersecurity Training Platform

Kurukshetra is an intentionally vulnerable web application designed for cybersecurity training and education. It provides a safe environment to practice security testing techniques and understand common vulnerabilities as defined by the OWASP Top 10 (2021).

## ⚠️ Security Warning

This application contains **intentional security vulnerabilities** for educational purposes. 

**DO NOT**:
- Use real credentials or sensitive information
- Deploy to production environments
- Expose this application to the internet

## Features

- Implementations of all OWASP Top 10 (2021) vulnerabilities
- Supports both SQL (SQLite) and NoSQL (MongoDB) injection scenarios
- Multiple vulnerability difficulty levels
- Progress tracking for training purposes
- Backend API built with Express.js
- Frontend built with React

## OWASP Top 10 (2021) Vulnerabilities

1. **A01:2021 – Broken Access Control**
2. **A02:2021 – Cryptographic Failures**
3. **A03:2021 – Injection**
4. **A04:2021 – Insecure Design**
5. **A05:2021 – Security Misconfiguration**
6. **A06:2021 – Vulnerable Components**
7. **A07:2021 – Authentication & Identification Failures**
8. **A08:2021 – Software & Data Integrity Failures**
9. **A09:2021 – Security Logging & Monitoring Failures**
10. **A10:2021 – Server-Side Request Forgery**

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional, for NoSQL scenarios)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/kurukshetra.git
   cd kurukshetra
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../client
   npm install
   ```

4. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database
   ```
   cd ../server
   npm run setup
   ```

6. Start the application
   ```
   # In server directory
   npm run dev
   
   # In another terminal, in client directory
   npm start
   ```

7. Access the application at `http://localhost:3000`

## Usage

1. Register a new account or use the default credentials:
   - Username: admin
   - Password: admin123

2. Explore different vulnerability categories from the dashboard
3. Attempt to exploit vulnerabilities using techniques like:
   - SQL/NoSQL Injection
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Path Traversal
   - Command Injection
   - And more...

## Educational Resources

For each vulnerability category, Kurukshetra provides:
- Background information
- Detection techniques
- Exploitation examples
- Remediation guidance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is intended for educational purposes only. The authors are not responsible for any misuse or damage caused by this application. Always practice security testing only on systems you have permission to test.
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OWASP Top 10 (2021) for vulnerability guidance
- Various open-source security training applications for inspiration
## License

This project is licensed under the MIT License - see the LICENSE file for details.
