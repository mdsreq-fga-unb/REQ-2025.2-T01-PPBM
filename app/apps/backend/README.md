# PPBM Backend

Backend REST API for the PPBM (Programa Bombeiro Mirim) management system.

## Tech Stack

- **Node.js 18+** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth)
- **Winston** - Logging
- **Jest + Supertest** - Testing framework

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # REST endpoint handlers
│   │   ├── alunos.ts
│   │   ├── docentes.ts
│   │   ├── turmas.ts
│   │   ├── presencas.ts
│   │   └── usuarios.ts
│   ├── utils/          # Shared utilities
│   │   ├── validation.ts
│   │   ├── supabase_wrapper.ts
│   │   └── utils.ts
│   ├── interfaces/     # TypeScript interfaces
│   ├── environment.ts  # Environment configuration
│   ├── logger.ts       # Winston logger setup
│   └── index.ts        # Application entry point
├── tests/              # Test suites
│   ├── controllers/    # Controller integration tests
│   ├── utils/          # Utility unit tests
│   ├── helpers/        # Test helpers
│   └── mocks/          # Mock implementations
├── docs/               # Documentation
├── logs/               # Application logs
└── dist/               # Compiled JavaScript (generated)
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account and project

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:6140` with hot reload enabled.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run production build:**
   ```bash
   npm start
   ```

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
PORT=6140
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS Configuration
CORS_ORIGIN=http://localhost:6140
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
Tests cover:
- **Validation utilities** - CPF/email validation, capacity checks
- **Controller endpoints** - CRUD operations for all P0 controllers
- **Error handling** - Validation failures, missing entities, conflicts

## Docker Deployment

### SSL Certificate Setup (Required for Docker)

Before starting Docker, you need to set up SSL certificates. See detailed instructions in `../ssl/README.md`.

**Quick Start with mkcert (Local Development):**

```bash
# Install mkcert
brew install mkcert  # macOS
# or follow instructions for your OS

# Install local CA
mkcert -install

# Generate certificates
cd ../ssl
mkcert -cert-file fullchain.pem -key-file privkey.pem localhost 127.0.0.1 ::1
cd ../backend
```

**Alternative: Development Without SSL**

If you want to skip SSL for local development:

1. Edit `../nginx.conf` - comment out HTTPS server block (lines 45-128)
2. Uncomment HTTP server block (lines 130-172)
3. Update `../docker-compose.yml` port to `"8080:8080"`
4. Access at `http://localhost:8080`

### Using Docker Compose (Recommended)

1. **Build and start services:**
   ```bash
   docker-compose up -d
   ```
   Backend will be available at `https://localhost:6140`

2. **View logs:**
   ```bash
   docker-compose logs -f
   # Or use the helper script:
   python3 scripts/follow_logs.py
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after changes:**
   ```bash
   docker-compose up -d --build
   # Or use the helper script:
   python3 scripts/run_docker_and_follow.py
   ```

### Run Tests in Docker

```bash
docker-compose --profile test run --rm backend-test
```

### Docker Services

- **ppbm-backend** - Node.js backend application (port 6140)
- **ppbm-nginx** - Nginx reverse proxy (port 6140)
- **ppbm-backend-test** - Test runner (profile: test)

### Docker Volumes

- `node_modules_data` - Node.js dependencies
- `dist_data` - Compiled TypeScript output
- `logs_data` - Application logs

## API Endpoints

### Health Check
```
GET /health
```

### Usuarios (Admins)
```
GET    /usuarios/listar
GET    /usuarios/detalhe/:id
GET    /usuarios/verificar-email?email=...
POST   /usuarios/criar
PUT    /usuarios/atualizar/:id
DELETE /usuarios/deletar/:id
```

### Alunos (Students)
```
GET    /alunos/listar?page=1&pageSize=20&turmaId=...&unidade=...&cidade=...&nome=...&neurodivergente=...
GET    /alunos/detalhe/:id
POST   /alunos/criar
PUT    /alunos/atualizar/:id
DELETE /alunos/deletar/:id
```

### Docentes (Teachers)
```
GET    /docentes/listar?page=1&pageSize=20&unidade=...&cidade=...&nome=...&email=...&cpf=...
GET    /docentes/detalhe/:id
POST   /docentes/criar
PUT    /docentes/atualizar/:id
DELETE /docentes/deletar/:id
```

### Turmas (Classes)
```
GET    /turmas/listar?page=1&pageSize=20&unidade=...&cidade=...&nome=...
GET    /turmas/detalhe/:id
POST   /turmas/criar
PUT    /turmas/atualizar/:id
DELETE /turmas/deletar/:id

# Docentes por Turma
GET    /turmas/:id/docentes           # List docentes assigned to a turma
POST   /turmas/:id/docentes           # Add a docente to a turma (body: { id_docente })
PUT    /turmas/:id/docentes           # Update all docentes for a turma (body: { docente_ids: [] })
DELETE /turmas/:id/docentes/:docenteId # Remove a docente from a turma
```

### Presencas (Attendance)
```
GET    /presencas/listar?page=1&pageSize=20&alunoId=...&turmaId=...&docenteId=...&status=...&from=...&to=...
GET    /presencas/detalhe/:id
POST   /presencas/criar
PUT    /presencas/atualizar/:id
DELETE /presencas/deletar/:id
```

## Database Schema

See `database_schema.txt` for complete PostgreSQL schema including:
- Tables: alunos, docentes, turmas, presencas, justificativa, etc.
- Relationships and foreign keys
- Constraints and indexes

## Development Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test:**
   ```bash
   npm run dev
   npm test
   ```

3. **Build and verify:**
   ```bash
   npm run build
   npm start
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

## Logging

Logs are written to:
- `logs/all.log` - All log levels
- `logs/error.log` - Error level only
- Console output with color coding

Log levels: `error`, `warn`, `info`, `http`, `debug`

## SSL Certificate Management

### Local Development Certificates

The project uses local SSL certificates stored in the `../ssl/` directory. These certificates are:
- **NOT committed to git** (for security)
- **Required for Docker** to start with HTTPS
- **Easy to generate** using mkcert

### Generate Local Certificates

```bash
# Using mkcert (recommended)
cd ../ssl
mkcert -cert-file fullchain.pem -key-file privkey.pem localhost 127.0.0.1 ::1

# Using OpenSSL (alternative)
cd ../ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/C=BR/ST=DF/L=Brasilia/O=PPBM/CN=localhost"
```

### Production Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot  # Ubuntu/Debian
brew install certbot          # macOS

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy to ssl directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ../ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ../ssl/
sudo chmod 644 ../ssl/fullchain.pem
sudo chmod 600 ../ssl/privkey.pem
```

For complete SSL setup instructions, see `../ssl/README.md`.

## Troubleshooting

### SSL Certificate Errors

**Problem:** Docker fails to start with "No such file or directory" for SSL certificates.

**Solution:** Generate SSL certificates before starting Docker (see SSL Certificate Management above).

### Port Already in Use
```bash
# Find process using port 6140
lsof -i :6140
# Kill the process
kill -9 <PID>
```

### Docker Permission Issues
```bash
# Reset Docker volumes
docker-compose down -v
docker-compose up -d --build
```

### Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache
# Run tests with verbose output
npm test -- --verbose
```

### Browser Shows "Not Secure" Warning

**Problem:** Using self-signed certificates or mkcert not properly installed.

**Solution:**
- For mkcert: Run `mkcert -install` to trust the local CA
- For self-signed: Accept the browser warning (development only)
- For production: Use Let's Encrypt certificates

## Contributing

1. Follow TypeScript and ESLint conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before committing
5. Use conventional commit messages

## License

ISC

