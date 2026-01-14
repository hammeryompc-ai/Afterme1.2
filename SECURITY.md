# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in AfterMe, please report it by emailing the maintainers. Do NOT open a public issue.

## Secret Management

### MongoDB Credentials

**IMPORTANT**: Never commit MongoDB connection strings with credentials to version control.

#### If a MongoDB secret was leaked:

1. **Rotate the credentials immediately**:
   - Log into MongoDB Atlas (https://cloud.mongodb.com)
   - Navigate to Database Access
   - Delete the compromised user account
   - Create a new user with a strong, unique password
   - Update your local `.env` file with the new credentials

2. **Revoke access**:
   - Check MongoDB Atlas audit logs for any unauthorized access
   - Review all database operations during the exposure period
   - Consider rotating all API keys and secrets that may have been exposed

3. **Update your application**:
   - Update all deployment environments (production, staging, etc.) with new credentials
   - Verify all services are using the new connection string
   - Test connectivity to ensure services remain operational

4. **Monitor for breaches**:
   - Enable MongoDB Atlas monitoring and alerts
   - Review access logs for suspicious activity
   - Set up IP whitelisting to restrict database access

### Environment Variables Best Practices

1. **Never commit `.env` files**:
   - The `.gitignore` file is configured to exclude all `.env*` files
   - Always use `.env.example` files (without actual secrets) as templates

2. **Use strong, unique secrets**:
   - Generate JWT secrets with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Use different secrets for development, staging, and production
   - Never reuse passwords across services

3. **Production deployment**:
   - Use environment variables provided by your hosting platform (Heroku, AWS, etc.)
   - Never store production credentials in files
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)

4. **Local development**:
   - Copy `.env.example` to `.env` for local development
   - Use local MongoDB instance when possible: `mongodb://localhost:27017/afterme`
   - Never use production credentials for local development

### Required Environment Variables

For security, the following environment variables MUST be set:

```bash
# MongoDB connection (use local for development)
MONGODB_URI=mongodb://localhost:27017/afterme

# JWT secret (generate a strong random string)
JWT_SECRET=<generate-with-crypto-randomBytes>

# Application settings
PORT=5000
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:6000
```

### Code Security

1. **Dependencies**:
   - Run `npm audit` regularly to check for vulnerabilities
   - Keep dependencies up to date
   - Review security advisories for used packages

2. **Input validation**:
   - Always validate and sanitize user input
   - Use parameterized queries to prevent injection attacks
   - Implement rate limiting to prevent abuse

3. **Authentication**:
   - Use bcrypt for password hashing (already implemented)
   - Implement JWT token expiration
   - Use HTTPS in production
   - Implement proper session management

## Security Checklist

Before deploying to production:

- [ ] All `.env` files are in `.gitignore`
- [ ] Production secrets are stored in secure environment variables
- [ ] JWT_SECRET is a strong, randomly generated value
- [ ] MongoDB user has minimum required permissions
- [ ] MongoDB IP whitelist is configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] Dependencies are up to date and audited

## Incident Response

If you suspect a security breach:

1. Immediately rotate all credentials
2. Review access logs
3. Notify all team members
4. Document the incident
5. Implement additional security measures
6. Consider consulting a security professional

## Additional Resources

- [MongoDB Atlas Security Best Practices](https://docs.mongodb.com/manual/administration/security-checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
