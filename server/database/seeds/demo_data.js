const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    // Clear existing data
    await knex('users').del();
    await knex('products').del();
    await knex('vulnerabilities').del();

    // Add demo users
    await knex('users').insert([
        {
            username: 'admin',
            email: 'admin@kurukshetra.test',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin'
        },
        {
            username: 'user',
            email: 'user@kurukshetra.test', 
            password: await bcrypt.hash('user123', 10),
            role: 'user'
        }
    ]);

    // Add demo products with intentional vulnerabilities in data
    await knex('products').insert([
        {
            name: '<script>alert("XSS")</script>Vulnerable Product',
            description: 'Product with XSS vulnerability',
            price: 99.99,
            stock: 10
        },
        {
            name: 'SQL Injection Demo',
            description: 'Try searching with: 1\' OR \'1\'=\'1',
            price: 45.50,
            stock: 15
        },
        {
            name: 'Unsafe Data Product',
            description: '<img src="x" onerror="javascript:alert(\'XSS in description\')">',
            price: 29.99,
            stock: 8
        },
        {
            name: 'CSRF Vulnerable Item',
            description: 'This product demonstrates CSRF vulnerabilities when editing',
            price: 149.99,
            stock: 5
        },
        {
            name: 'DOM-XSS Product',
            description: 'Product with location.hash vulnerability: <div id="dynamicContent"></div>',
            price: 199.99,
            stock: 3
        },
        {
            name: 'Regular Product',
            description: 'A normal product without vulnerabilities for comparison',
            price: 50.00,
            stock: 25
        }
    ]);

    // Add vulnerability documentation
    await knex('vulnerabilities').insert([
        {
            name: 'SQL Injection',
            category: 'Injection',
            description: 'SQL injection vulnerability in product search',
            solution: 'Use parameterized queries'
        },
        {
            name: 'Cross-Site Scripting (XSS)',
            category: 'Injection',
            description: 'Unsanitized input allows attackers to inject client-side scripts',
            solution: 'Implement proper input validation and output encoding'
        },
        {
            name: 'Cross-Site Request Forgery (CSRF)',
            category: 'Broken Authentication',
            description: 'Allows attackers to trick users into performing unwanted actions',
            solution: 'Implement anti-CSRF tokens and SameSite cookie attributes'
        },
        {
            name: 'Broken Access Control',
            category: 'Authorization',
            description: 'Insufficient restrictions on authenticated users',
            solution: 'Implement proper authorization checks at the server side'
        },
        {
            name: 'Security Misconfiguration',
            category: 'Configuration',
            description: 'Improperly configured servers, frameworks, or applications',
            solution: 'Establish secure configuration processes and regular security reviews'
        },
        {
            name: 'Sensitive Data Exposure',
            category: 'Data Protection',
            description: 'Inadequate protection of sensitive information',
            solution: 'Encrypt sensitive data at rest and in transit'
        },
        {
            name: 'Insecure Deserialization',
            category: 'Data Processing',
            description: 'Processing untrusted data without validation',
            solution: 'Never deserialize data from untrusted sources'
        }
    ]);
};
