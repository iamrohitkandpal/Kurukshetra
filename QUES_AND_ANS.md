# Kurukshetra - Frequently Asked Questions

## General Questions

### Q: What is Kurukshetra?
**A:** Kurukshetra is an intentionally vulnerable web application designed for cybersecurity training and education. It implements vulnerabilities based on the OWASP Top 10 (2021) to provide a safe environment for practicing security testing.

### Q: Is it safe to use Kurukshetra on my computer?
**A:** Kurukshetra is designed to be used in a controlled environment. While the vulnerabilities are contained within the application, it's recommended to run it on a separate development environment or virtual machine, especially if you're deploying the MongoDB component.

### Q: Can I use Kurukshetra for a security training class?
**A:** Yes! Kurukshetra is specifically designed for education and training purposes. It's ideal for classrooms, workshops, and security training exercises.

## Technical Questions

### Q: Why does Kurukshetra support both SQLite and MongoDB?
**A:** This dual-database design allows users to practice both SQL and NoSQL injection techniques. Different types of databases have different security considerations, so this provides a more comprehensive learning experience.

### Q: How do I switch between SQLite and MongoDB?
**A:** You can toggle between databases using the Database Selection panel in the UI. This sends a request to the API that changes the active database connection for subsequent requests.

### Q: Are there different difficulty levels for the vulnerabilities?
**A:** Yes, vulnerabilities are implemented at different difficulty levels:
- **Basic**: Clear and obvious vulnerabilities for beginners
- **Intermediate**: Requires more understanding of the vulnerability
- **Advanced**: Requires deeper security knowledge and potentially chaining multiple techniques

### Q: What should I do if I find an unintentional vulnerability?
**A:** If you believe you've found a vulnerability that wasn't intentionally implemented for training purposes, please create an issue on the GitHub repository.

## Security Questions

### Q: I found a way to access the admin panel without proper credentials. Is this intentional?
**A:** Yes, there are multiple intentional authentication bypasses and broken access controls in Kurukshetra. This is part of the A01 (Broken Access Control) and A07 (Authentication & Identification Failures) categories.

### Q: The application stores sensitive data in plain text. Is this a bug?
**A:** No, this is an intentional vulnerability representing A02 (Cryptographic Failures). In a real-world application, sensitive data should always be encrypted.

### Q: I was able to upload and execute malicious files. Should this be fixed?
**A:** This is an intentional vulnerability representing A03 (Injection) and A05 (Security Misconfiguration). Kurukshetra intentionally allows dangerous file uploads for training purposes.

## Usage Questions

### Q: How do I track my progress in identifying vulnerabilities?
**A:** Kurukshetra includes a progress tracking feature in the dashboard. Successfully exploiting a vulnerability will mark it as completed.

### Q: Can I reset my progress?
**A:** Yes, there's a "Reset Progress" button in the vulnerability progress section of the dashboard.

### Q: How do I know when I've successfully exploited a vulnerability?
**A:** When you successfully exploit a vulnerability, you'll typically receive feedback through:
1. Access to protected resources
2. Visible data that should be hidden
3. Execution of operations that should be restricted
4. Automatic progress tracking in some cases

## Development Questions

### Q: How can I contribute to Kurukshetra?
**A:** Contributions are welcome! You can contribute by:
1. Adding new vulnerabilities
2. Improving documentation
3. Enhancing UI/UX
4. Fixing non-intentional bugs

### Q: Can I add my own custom vulnerabilities?
**A:** Yes, the codebase is designed to be extensible. You can create new routes and components to demonstrate additional vulnerabilities.

### Q: How should I set up my development environment?
**A:** Follow these steps:
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Run the database setup script
5. Start the development servers

## Troubleshooting

### Q: I can't connect to MongoDB. What should I do?
**A:** Ensure MongoDB is installed and running on your system. The default connection string is `mongodb://localhost:27017/kurukshetra`, but you can modify this in the .env file.

### Q: The application shows a blank page after login. How do I fix this?
**A:** This could be due to an issue with JWT token handling. Try clearing your browser's local storage and cookies, then log in again.

### Q: File uploads aren't working. What's wrong?
**A:** Check if the uploads directory has the proper write permissions. Also verify that the environment variable `UPLOAD_DIR` is correctly set.

### Q: I'm getting CORS errors when connecting to the API. How do I resolve this?
**A:** Ensure the CLIENT_URL in your server's .env file matches the actual URL where the frontend is running (typically `http://localhost:3000` in development).