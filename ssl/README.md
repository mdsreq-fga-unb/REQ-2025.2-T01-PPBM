# SSL Certificates Directory

This directory contains SSL certificates for the PPBM backend HTTPS server.

## ⚠️ Important Security Notes

- **DO NOT** commit actual SSL certificates to git
- This directory is git-ignored by default
- Keep your private keys secure and never share them

## Required Files

For the nginx server to work with HTTPS, you need two files in this directory:

```
ssl/
├── fullchain.pem    # Full certificate chain (public)
└── privkey.pem      # Private key (keep secret!)
```

## Local Development Setup

### Option 1: Using mkcert (Recommended for Local Development)

[mkcert](https://github.com/FiloSottile/mkcert) creates locally-trusted development certificates.

1. **Install mkcert:**
   ```bash
   # macOS
   brew install mkcert
   
   # Linux
   # Follow instructions at https://github.com/FiloSottile/mkcert#installation
   
   # Windows
   # Use Chocolatey: choco install mkcert
   ```

2. **Install local CA:**
   ```bash
   mkcert -install
   ```

3. **Generate certificates:**
   ```bash
   cd ssl
   mkcert -cert-file fullchain.pem -key-file privkey.pem localhost 127.0.0.1 ::1
   ```

4. **Start Docker:**
   ```bash
   cd ..
   docker-compose up -d
   ```

Your backend will now be available at `https://localhost:6140`

### Option 2: Self-Signed Certificates (Alternative)

If you can't use mkcert, you can create self-signed certificates:

```bash
cd ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=BR/ST=DF/L=Brasilia/O=PPBM/CN=localhost"
```

**Note:** Browsers will show a security warning for self-signed certificates. You'll need to accept the risk to proceed.

### Option 3: Development Without SSL

If you want to develop without SSL:

1. Edit `nginx.conf` and comment out the HTTPS server block (lines 45-128)
2. Uncomment the HTTP server block (lines 130-172)
3. Update `docker-compose.yml` port mapping to `"8080:8080"`
4. Access your backend at `http://localhost:8080`

## Production Setup

### Using Let's Encrypt (Recommended for Production)

1. **Install Certbot:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install certbot
   
   # macOS
   brew install certbot
   ```

2. **Generate certificates:**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. **Copy certificates to this directory:**
   ```bash
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
   sudo chmod 644 ./ssl/fullchain.pem
   sudo chmod 600 ./ssl/privkey.pem
   ```

4. **Update nginx.conf:**
   - Change `server_name localhost _;` to `server_name your-domain.com;`

5. **Set up auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

### Using Existing Certificates

If you already have SSL certificates from another provider:

1. Copy your certificate chain to `ssl/fullchain.pem`
2. Copy your private key to `ssl/privkey.pem`
3. Ensure proper permissions:
   ```bash
   chmod 644 ssl/fullchain.pem
   chmod 600 ssl/privkey.pem
   ```

## Troubleshooting

### "No such file or directory" error when starting Docker

**Problem:** nginx can't find the SSL certificates.

**Solution:** Make sure you have created the certificates in the `ssl/` directory before starting Docker.

### Browser shows "Your connection is not private"

**Problem:** Using self-signed certificates or mkcert not properly installed.

**Solution:**
- For mkcert: Run `mkcert -install` to trust the local CA
- For self-signed: Click "Advanced" → "Proceed to localhost (unsafe)"

### Certificate expired

**Problem:** Self-signed certificates or Let's Encrypt certificates have expired.

**Solution:**
- For self-signed: Regenerate certificates using the commands above
- For Let's Encrypt: Run `sudo certbot renew`

## File Permissions

Recommended permissions for security:

```bash
chmod 755 ssl/                    # Directory readable by all
chmod 644 ssl/fullchain.pem      # Certificate readable by all
chmod 600 ssl/privkey.pem        # Private key readable only by owner
```

## Additional Resources

- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

