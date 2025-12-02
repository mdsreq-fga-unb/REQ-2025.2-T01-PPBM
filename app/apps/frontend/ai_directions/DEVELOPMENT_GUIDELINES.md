# AI Development Guidelines for Frontend

This document provides guidelines and best practices for AI assistants working on the Programa Bombeiro Mirim frontend codebase.

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components (e.g., AlunosTable.svelte)
│   ├── docente/        # Teacher-specific components
│   ├── ui/             # Reusable UI components (FormSelect, DataTable, Toast, etc.)
│   └── *.astro         # Shared layout components (Header, Sidebar, Footer)
├── lib/
│   ├── api.ts          # API helpers with authentication
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Astro pages (routes)
├── stores/             # Svelte stores for state management
├── interfaces/         # TypeScript interfaces
└── styles/             # Global styles
```

---

## 🔍 Component Reuse

### Always check for existing components before creating new ones

Before creating a new page or feature, search for existing components that can be reused:

1. **UI Components** (`src/components/ui/`):
   - `FormSelect.svelte` - Styled select dropdowns
   - `FormInput.svelte` - Styled input fields
   - `DataTable.svelte` - Tables with pagination, sorting
   - `Toast.svelte` - Toast notifications
   - `ConfirmDialog.svelte` - Confirmation modals
   - `Badge.svelte` - Status badges

2. **Layout Components**:
   - `Header.astro` / `Headerdocente.astro` / `Headerusuario.astro`
   - `Sidebar.astro`
   - `Footer.astro`

3. **Feature Components**:
   - Check `src/components/admin/` for admin features
   - Check `src/components/docente/` for teacher features

### Example: Using FormSelect instead of native select

```svelte
<!-- ❌ Don't use native select -->
<select id="turma" bind:value={turmaFilter}>
    <option value="">Todas as turmas</option>
</select>

<!-- ✅ Use the standard FormSelect component -->
<script>
    import FormSelect from "../ui/FormSelect.svelte";
</script>

<FormSelect
    id="turma"
    label="Filtrar por turma"
    bind:value={turmaFilter}
    on:change={handleFilterChange}
>
    <option value="">Todas as turmas</option>
</FormSelect>
```

---

## 🔐 Authentication & API Communication

### Always use the `apiFetch` helper for backend communication

The project has an authentication helper in `src/lib/api.ts` that should be used for all API calls.

**Features of `apiFetch`:**
- Automatically retrieves and attaches the auth token
- Sets `Content-Type: application/json` header
- Handles token refresh on 401 errors
- Returns standardized response: `{ success: boolean, data?: T, error?: string }`

### Usage Examples

```typescript
import { apiFetch } from "../../lib/api";

// GET request
const response = await apiFetch<{ data: Turma[] }>("/turmas/listar?pageSize=100");
if (response.success) {
    turmas = response.data?.data || [];
}

// POST request
const response = await apiFetch("/presencas/criar", {
    method: "POST",
    body: JSON.stringify(payload),
});

// PUT request
const response = await apiFetch(`/presencas/atualizar/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
});

// DELETE request
const response = await apiFetch(`/alunos/deletar/${id}`, {
    method: "DELETE",
});
```

### ❌ Don't manually handle authentication

```typescript
// ❌ Avoid this pattern
const token = localStorage.getItem("bm_token");
const response = await fetch(`${apiUrl}/turmas/listar`, {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});
```

### For Astro pages with inline scripts

If you must use inline `<script>` tags in Astro pages (not recommended), use this pattern:

```javascript
function getAuthToken() {
    return localStorage.getItem('bm_token');
}

const token = getAuthToken();
const response = await fetch(`${backendUrl}/endpoint`, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

**Preferred approach:** Create a Svelte component and use `apiFetch`.

---

## 📄 Page Structure

### Prefer Svelte components over inline scripts

When creating new pages, follow this pattern:

1. **Create a Svelte component** for the page logic (e.g., `ControlePresencasAdmin.svelte`)
2. **Use an Astro page** as a thin wrapper with layout only

```astro
---
// presencas.astro
import Header from "../../components/Header.astro";
import Sidebar from "../../components/Sidebar.astro";
import ControlePresencasAdmin from "../../components/admin/ControlePresencasAdmin.svelte";
---

<html lang="pt-br">
    <head>...</head>
    <body>
        <Header />
        <main class="main-content">
            <div class="content-wrapper">
                <Sidebar />
                <div class="container">
                    <ControlePresencasAdmin client:load />
                </div>
            </div>
        </main>
    </body>
</html>
```

---

## 🎨 Styling Guidelines

1. **Use CSS custom properties** defined in the global styles or page-level `:root`
2. **Follow existing color conventions**:
   - Primary: `#4A5568`
   - Accent: `#3182CE`
   - Success: `#48BB78`
   - Warning: `#ED8936`
   - Danger: `#E53E3E`
   - Background: `#F7FAFC`

3. **Use existing UI component styles** - don't redefine styles for buttons, inputs, etc.

---

## 🔄 State Management

1. **Component-level state**: Use Svelte's reactive declarations (`$:`) and `let` bindings
2. **Shared state**: Check `src/stores/` for existing stores (e.g., `auth.ts`)
3. **Toast notifications**: Use the `Toast.svelte` component pattern:

```svelte
<script>
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    function displayToast(message: string, type: typeof toastType = "info") {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }
</script>

<Toast bind:show={showToast} message={toastMessage} type={toastType} />
```

---

## ✅ Checklist Before Creating New Features

- [ ] Searched for existing components in `src/components/ui/`
- [ ] Checked if similar feature components exist in `src/components/admin/` or `src/components/docente/`
- [ ] Using `apiFetch` for all backend API calls
- [ ] Using `FormSelect`, `FormInput`, `DataTable` instead of native elements
- [ ] Using `Toast` component for user feedback
- [ ] Using `ConfirmDialog` for destructive actions
- [ ] Following the Astro page + Svelte component pattern
- [ ] Using TypeScript interfaces for data types
- [ ] Handling loading and error states

---

## 📚 Key Files Reference

| Purpose              | File                                     |
| -------------------- | ---------------------------------------- |
| API helpers          | `src/lib/api.ts`                         |
| Supabase client      | `src/lib/supabase.ts`                    |
| Auth store           | `src/stores/auth.ts`                     |
| Table interfaces     | `src/interfaces/table.ts`                |
| Form Select (Svelte) | `src/components/ui/FormSelect.svelte`    |
| Form Select (Astro)  | `src/components/ui/FormSelect.astro`     |
| Data Table           | `src/components/ui/DataTable.svelte`     |
| Toast                | `src/components/ui/Toast.svelte`         |
| Confirm Dialog       | `src/components/ui/ConfirmDialog.svelte` |

---

## 🚀 Quick Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm check
```
