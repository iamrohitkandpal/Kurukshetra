# Kurukshetra - Vulnerable Web Application

A deliberately vulnerable web application designed for cybersecurity training and education, focusing on the OWASP Top 10 (2021).

**WARNING**: This application contains intentional security vulnerabilities. DO NOT deploy to production environments or public-facing servers.

## Overview

Kurukshetra is an intentionally vulnerable web application that simulates security flaws found in real-world applications. It's designed as a training platform for cybersecurity students to practice red team techniques in a realistic but controlled environment.

The application implements vulnerabilities from the OWASP Top 10 (2021) with multiple difficulty levels for each category.

## Features

- Full-stack web application with a React frontend and Node.js/Express backend
- Multiple modules, each showcasing different vulnerabilities
- Progressive difficulty levels (beginner → intermediate → advanced → expert)
- Comprehensive solution guide explaining all vulnerabilities and exploitation steps
- Safe to run in local or containerized environments

## OWASP Top 10 (2021) Covered

1. **A01 - Broken Access Control**
2. **A02 - Cryptographic Failures**
3. **A03 - Injection**
4. **A04 - Insecure Design**
5. **A05 - Security Misconfiguration**
6. **A06 - Vulnerable and Outdated Components**
7. **A07 - Identification and Authentication Failures**
8. **A08 - Software and Data Integrity Failures**
9. **A09 - Security Logging and Monitoring Failures**
10. **A10 - Server-Side Request Forgery (SSRF)**

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Git

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kurukshetra.git
   cd kurukshetra
   ```

2. Install server dependencies:
   ```
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Docker Setup

1. Build and run using Docker Compose:
   ```
   docker-compose up --build
   ```

2. Access the application at http://localhost:5000

## Usage Guide

### For Students

1. Start by exploring the application normally to understand its functionality
2. Look for security issues in each module
3. Try to identify and exploit vulnerabilities without looking at the solution
4. Use standard penetration testing tools and methodologies
5. Document your findings and exploitation methods

### For Instructors

1. Review the `solutions.txt` file for detailed explanations of all vulnerabilities
2. Use the application to demonstrate real-world security issues
3. Assign specific modules as exercises
4. Evaluate student findings against the solution guide
5. Extend the application by adding new vulnerability examples

## Deployment

This application can be deployed using:

- Docker (recommended for local training)
- Vercel (for frontend-only components)
- Netlify (for frontend-only components)

For full functionality including backend features, use Docker deployment.

## Safety Warnings

- **NEVER** deploy this application on public servers or production environments
- **DO NOT** use real or sensitive data with this application
- **ALWAYS** run in a controlled, isolated environment
- Consider using a virtual machine or container to isolate the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OWASP Foundation for the Top 10 vulnerability list
- Various open-source security training projects that inspired this work
