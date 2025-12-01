# Authentication Implementation Plan

## Overview

This document outlines the plan to implement real authentication for the Bombeiro Mirim system, replacing the current mock authentication with Supabase Auth integration.

---

## Current State

### Frontend
- `src/stores/auth.ts` - Mock authentication with hardcoded users
- `src/components/Login.svelte` - UI component (keep mostly as-is)
- `src/pages/login.astro` - Login page

### Backend
- Uses Supabase (PostgreSQL) via `SupabaseWrapper`
- Has basic CRUD for `admins` table
- No real auth endpoints

### Database User Tables
Based on `database_schema.txt`:

| Table          | ID Field         | Email Field         | Other Key Fields                                              |
| -------------- | ---------------- | ------------------- | ------------------------------------------------------------- |
| `admins`       | `id_admin`       | `email`             | -                                                             |
| `docentes`     | `id_docente`     | `email_docente`     | `nome_docente`, `cpf_docente`, `unidade_docente`              |
| `responsaveis` | `id_responsavel` | `email_responsavel` | `nome_responsavel`, `cpf_responsavel`, `telefone_responsavel` |

---

## Implementation Plan

### Phase 1: Backend Auth Controller

**File: `backend/src/controllers/auth.ts`**

Create new authentication controller with endpoints:

1. **POST `/auth/login`**
   - Accept: `{ email: string, password: string }`
   - Check email against Supabase Auth
   - Determine user type by checking admins → docentes → responsaveis tables
   - Return: `{ success, token, user: { id, email, userType, name } }`

2. **POST `/auth/register`** (for responsáveis only - admins/docentes created by admin)
   - Accept: `{ email, password, nome, telefone, cpf }`
   - Create Supabase Auth user
   - Create entry in `responsaveis` table
   - Return: `{ success, user }`

3. **GET `/auth/me`**
   - Accept: Authorization header with JWT
   - Return current user info from appropriate table

4. **POST `/auth/logout`**
   - Invalidate session (client-side mainly)

5. **GET `/auth/verify`**
   - Verify if token is still valid

### Phase 2: Backend Auth Middleware

**File: `backend/src/middleware/auth.ts`**

- Verify JWT token from Authorization header
- Attach user info to request object
- Role-based access control helpers

### Phase 3: Frontend API Helper

**File: `frontend/src/lib/api.ts`**

Create centralized API helper:
- Base URL configuration
- Fetch wrapper with auth headers
- Error handling
- Token management

### Phase 4: Frontend Auth Store Refactor

**File: `frontend/src/stores/auth.ts`**

Refactor to:
- Call real backend API instead of mock
- Store JWT token in localStorage
- Handle token refresh
- Proper logout with token cleanup

### Phase 5: Frontend Login Component Update

**File: `frontend/src/components/Login.svelte`**

Update to:
- Call new auth API
- Handle loading states
- Better error messages from backend
- Optional: Add registration link for responsáveis

---

## File Changes Summary

### New Files (Backend)
1. `backend/src/controllers/auth.ts` - Auth controller
2. `backend/src/middleware/auth.ts` - Auth middleware
3. `backend/src/interfaces/auth.ts` - Auth interfaces

### New Files (Frontend)
1. `frontend/src/lib/api.ts` - API helper
2. `frontend/src/pages/cadastro.astro` - Registration page (optional)
3. `frontend/src/components/Cadastro.svelte` - Registration form (optional)

### Modified Files
1. `backend/src/index.ts` - Register auth controller
2. `frontend/src/stores/auth.ts` - Real API integration
3. `frontend/src/components/Login.svelte` - API calls + error handling

---

## User Types & Roles

| User Type     | Portuguese    | Table          | Can Self-Register | Dashboard Route |
| ------------- | ------------- | -------------- | ----------------- | --------------- |
| `admin`       | Administrador | `admins`       | No                | `/admin`        |
| `docente`     | Docente       | `docentes`     | No                | `/docente`      |
| `responsavel` | Responsável   | `responsaveis` | Yes               | `/usuario`      |

---

## API Response Formats

### Login Success
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "userType": "admin",
      "name": "Administrador"
    }
  }
}
```

### Login Error
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

---

## Execution Order

1. ✅ Create plan (this file)
2. ✅ Create `backend/src/interfaces/auth.ts`
3. ✅ Create `backend/src/controllers/auth.ts`
4. ✅ Create `backend/src/middleware/auth.ts`
5. ✅ Update `backend/src/index.ts` to register auth routes
6. ✅ Create `frontend/src/lib/api.ts`
7. ✅ Update `frontend/src/stores/auth.ts`
8. ✅ Update `frontend/src/components/Login.svelte`
9. [ ] Test full flow

---

## Notes

- Supabase Auth handles password hashing and JWT generation
- The backend validates tokens and determines user type from database tables
- Frontend stores token in localStorage for persistence
- Each user type has a different dashboard route
