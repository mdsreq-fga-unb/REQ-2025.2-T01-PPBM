# Implementation Plan: Responsável (Guardian) Portal

## Overview

Based on the analysis of the `prototipousuario.html` prototype and existing frontend components, this plan outlines the implementation of the complete "Portal do Responsável" (Guardian Portal) for the Bombeiro Mirim application.

---

## 1. Architecture Overview

### Current State
- **Existing pages**: `presencafilho.astro`, `relatorioindi.astro`, `comunicacao.astro` (empty)
- **Existing components**: `Headerusuario.astro`, `Sidebarusuario.astro`
- **Pattern used**: Astro pages with inline styles and minimal JavaScript

### Recommended Approach
Follow the **Admin pattern** with Svelte components for better interactivity:
- Create a unified `ResponsavelLayout.svelte` component
- Create individual section components in Svelte
- Add a navigation store for the responsável portal
- Integrate with the existing auth system and API

---

## 2. Files to Create

### 2.1 Stores

| File                                  | Description                 |
| ------------------------------------- | --------------------------- |
| `src/stores/responsavelNavigation.ts` | Navigation state management |

### 2.2 Components

| File                                                             | Description                      |
| ---------------------------------------------------------------- | -------------------------------- |
| `src/components/responsavel/ResponsavelLayout.svelte`            | Main layout wrapper              |
| `src/components/responsavel/ResponsavelHeader.svelte`            | Header component                 |
| `src/components/responsavel/ResponsavelSidebar.svelte`           | Sidebar navigation               |
| `src/components/responsavel/sections/PresencasFilho.svelte`      | Child attendance tracking        |
| `src/components/responsavel/sections/Comunicacao.svelte`         | Communication (messages/notices) |
| `src/components/responsavel/sections/RelatorioIndividual.svelte` | Individual reports               |

### 2.3 Pages

| File                                | Description                              |
| ----------------------------------- | ---------------------------------------- |
| `src/pages/responsavel/index.astro` | Main entry point (redirect or dashboard) |

---

## 3. Component Specifications

### 3.1 `responsavelNavigation.ts`

```typescript
import { writable } from 'svelte/store';

export type ResponsavelSection = 'presencas' | 'comunicacao' | 'relatorio';

function createNavigationStore() {
    const { subscribe, set } = writable<ResponsavelSection>('presencas');

    return {
        subscribe,
        setSection: (section: ResponsavelSection) => set(section),
        reset: () => set('presencas'),
    };
}

export const responsavelNavigation = createNavigationStore();
```

### 3.2 `ResponsavelLayout.svelte`

**Features:**
- Auth check on mount (redirect to `/login` if not authenticated)
- Verify user type is `responsavel`
- Responsive grid layout (sidebar + main content)
- Section switching based on navigation store
- Background gradient matching the prototype

### 3.3 `ResponsavelHeader.svelte`

**Features:**
- Logo icon with gradient (red theme `#E11D48`)
- Title: "Portal do Responsável"
- Subtitle: "Programa Bombeiro Mirim" / Welcome message with user name
- Status badges: "Sistema Ativo", user role
- Logout button with confirmation modal

### 3.4 `ResponsavelSidebar.svelte`

**Navigation Items:**
| Icon | Label                  | Section Key   |
| ---- | ---------------------- | ------------- |
| 📅    | Presenças do Meu Filho | `presencas`   |
| 💬    | Comunicação            | `comunicacao` |
| 📊    | Relatório Individual   | `relatorio`   |

**Styling:**
- Active state: `bg-[#E11D48]` with white text
- Hover state: `bg-slate-50`
- Rounded corners: `rounded-xl`

### 3.5 `PresencasFilho.svelte`

**Features:**
- Period selector (7/15/30 days or custom)
- Custom date range picker (shown when "custom" is selected)
- Child info display (name, class)
- Stats cards (4 columns):

| Card    | Gradient                        | Label         |
| ------- | ------------------------------- | ------------- |
| Total   | `from-blue-500 to-blue-600`     | Total de Dias |
| Present | `from-green-500 to-green-600`   | Presenças     |
| Late    | `from-yellow-500 to-yellow-600` | Atrasos       |
| Absent  | `from-red-500 to-red-600`       | Faltas        |

- Frequency progress bar with percentage
- Attendance history table:

| Column      | Description             |
| ----------- | ----------------------- |
| Data        | Formatted date          |
| Status      | Badge with icon (✅/⏰/❌) |
| Observações | Notes or "-"            |

**Data Integration:**
- Fetch child's attendance from API based on logged-in responsável
- Calculate statistics dynamically
- Update on period change

### 3.6 `Comunicacao.svelte`

**Features:**
- Tab navigation with 3 tabs:

| Tab                 | Content ID           |
| ------------------- | -------------------- |
| Mensagens Recebidas | `mensagensRecebidas` |
| Avisos Gerais       | `avisosGerais`       |
| Enviar Mensagem     | `enviarMensagem`     |

- **Mensagens Recebidas:**
  - List of received messages
  - Each message shows: subject, sender badge, urgency indicator
  - Message content preview
  - Timestamp (date + time)

- **Avisos Gerais:**
  - List of active notices
  - Type badge with colors:

| Type        | Badge Class                     |
| ----------- | ------------------------------- |
| informativo | `bg-blue-100 text-blue-700`     |
| importante  | `bg-yellow-100 text-yellow-700` |
| urgente     | `bg-red-100 text-red-700`       |
| evento      | `bg-green-100 text-green-700`   |

- **Enviar Mensagem:**
  - Form with fields:
    - Destinatário (select): Coordenação, Professor da Turma, Administração
    - Assunto (text input)
    - Mensagem (textarea, 6 rows)
  - Submit button
  - Success feedback

### 3.7 `RelatorioIndividual.svelte`

**Features:**
- Header with title, subtitle (child name), and "Exportar PDF" button
- Period selector (30/60/90 days or custom)
- Custom date inputs (shown when "custom" is selected)

- **Two-column layout:**

| Left Column             | Right Column           |
| ----------------------- | ---------------------- |
| Estatísticas do Período | Informações da Criança |

- **Statistics:**
  - Total de dias letivos
  - Presenças (green)
  - Atrasos (yellow)
  - Faltas (red)
  - Taxa de Frequência (bold, primary color)

- **Child Info:**
  - Nome
  - Idade (calculated from birth date)
  - Turma
  - Escola
  - Condição médica (if applicable, shown in red)

- **Weekly Frequency Chart:**
  - 7-column grid (Seg-Dom)
  - Visual representation of attendance pattern

- **Detailed History Table:**

| Column        | Description                |
| ------------- | -------------------------- |
| Data          | Formatted date             |
| Dia da Semana | Weekday name (capitalized) |
| Status        | Colored badge              |
| Observações   | Notes or "-"               |

---

## 4. Styling Guidelines

### Color Palette

| Element             | Color Code                             |
| ------------------- | -------------------------------------- |
| Primary             | `#E11D48` (Rose/Red)                   |
| Primary Dark        | `#BE123C`                              |
| Background Gradient | `from-white via-slate-50 to-slate-100` |
| Card Background     | `white`                                |
| Border              | `slate-200`                            |
| Text Primary        | `slate-900`                            |
| Text Secondary      | `slate-500`                            |

### Shared CSS Classes

```css
.soft-shadow {
    box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);
}

.modal-overlay {
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
}

.section-card {
    @apply bg-white rounded-3xl p-6 soft-shadow border border-slate-200;
}
```

### Status Badge Classes

| Status  | Background      | Text              |
| ------- | --------------- | ----------------- |
| present | `bg-green-100`  | `text-green-700`  |
| late    | `bg-yellow-100` | `text-yellow-700` |
| absent  | `bg-red-100`    | `text-red-700`    |

### Status Icons

| Status  | Icon |
| ------- | ---- |
| present | ✅    |
| late    | ⏰    |
| absent  | ❌    |

---

## 5. API Integration

### Required Endpoints

| Endpoint                              | Method | Description                             |
| ------------------------------------- | ------ | --------------------------------------- |
| `GET /presencas/filho/:childId`       | GET    | Get child's attendance records          |
| `GET /mensagens/responsavel`          | GET    | Get messages for the logged-in guardian |
| `POST /mensagens`                     | POST   | Send a new message                      |
| `GET /avisos`                         | GET    | Get general notices                     |
| `GET /criancas/:id`                   | GET    | Get child information                   |
| `GET /relatorios/frequencia/:childId` | GET    | Get frequency report data               |

### API Functions to Add in `src/lib/api.ts`

```typescript
// Child attendance
export async function getChildAttendance(
    childId: string, 
    startDate: string, 
    endDate: string
): Promise<ApiResponse<AttendanceRecord[]>>;

// Messages
export async function getResponsavelMessages(): Promise<ApiResponse<Message[]>>;

export async function sendMessage(data: {
    destinatario: string;
    assunto: string;
    conteudo: string;
}): Promise<ApiResponse<{ id: string }>>;

// Notices
export async function getNotices(): Promise<ApiResponse<Notice[]>>;

// Child info
export async function getChildInfo(childId: string): Promise<ApiResponse<ChildInfo>>;

// Reports
export async function getFrequencyReport(
    childId: string,
    startDate: string,
    endDate: string
): Promise<ApiResponse<FrequencyReport>>;
```

### Type Definitions

```typescript
interface AttendanceRecord {
    id: string;
    childId: string;
    data: string;
    status: 'presente' | 'atraso' | 'falta';
    observacoes?: string;
}

interface Message {
    id: string;
    tipo: 'recebida' | 'enviada';
    remetente: string;
    assunto: string;
    conteudo: string;
    timestamp: string;
    urgente: boolean;
}

interface Notice {
    id: string;
    tipo: 'informativo' | 'importante' | 'urgente' | 'evento';
    titulo: string;
    conteudo: string;
    timestamp: string;
    ativo: boolean;
}

interface ChildInfo {
    id: string;
    nome: string;
    cpf: string;
    nascimento: string;
    escola: string;
    turma: string;
    nomeResp: string;
    contatoResp: string;
    parentesco: string;
    condicaoMedica?: string;
    alergias?: string;
    obsMedicas?: string;
}

interface FrequencyReport {
    totalDias: number;
    presencas: number;
    atrasos: number;
    faltas: number;
    taxaFrequencia: number;
    historico: AttendanceRecord[];
}
```

---

## 6. Implementation Order

### Phase 1: Foundation (Priority: High)

| Step | Task                     | Files                                                  |
| ---- | ------------------------ | ------------------------------------------------------ |
| 1    | Create navigation store  | `src/stores/responsavelNavigation.ts`                  |
| 2    | Create header component  | `src/components/responsavel/ResponsavelHeader.svelte`  |
| 3    | Create sidebar component | `src/components/responsavel/ResponsavelSidebar.svelte` |
| 4    | Create layout wrapper    | `src/components/responsavel/ResponsavelLayout.svelte`  |
| 5    | Update main entry point  | `src/pages/responsavel/index.astro`                    |

### Phase 2: Presences Section (Priority: High)

| Step | Task                         | Files                                                       |
| ---- | ---------------------------- | ----------------------------------------------------------- |
| 6    | Create presences component   | `src/components/responsavel/sections/PresencasFilho.svelte` |
| 7    | Add attendance API functions | `src/lib/api.ts`                                            |
| 8    | Test with mock data          | -                                                           |
| 9    | Integrate with backend       | -                                                           |

### Phase 3: Communication Section (Priority: Medium)

| Step | Task                           | Files                                                    |
| ---- | ------------------------------ | -------------------------------------------------------- |
| 10   | Create communication component | `src/components/responsavel/sections/Comunicacao.svelte` |
| 11   | Add messaging API functions    | `src/lib/api.ts`                                         |
| 12   | Implement tab navigation       | -                                                        |
| 13   | Test message send/receive      | -                                                        |

### Phase 4: Reports Section (Priority: Medium)

| Step | Task                     | Files                                                            |
| ---- | ------------------------ | ---------------------------------------------------------------- |
| 14   | Create report component  | `src/components/responsavel/sections/RelatorioIndividual.svelte` |
| 15   | Add report API functions | `src/lib/api.ts`                                                 |
| 16   | Implement PDF export     | (placeholder initially)                                          |
| 17   | Test report generation   | -                                                                |

### Phase 5: Cleanup & Testing (Priority: Low)

| Step | Task                      | Description                                                       |
| ---- | ------------------------- | ----------------------------------------------------------------- |
| 18   | Remove/redirect old pages | `presencafilho.astro`, `comunicacao.astro`, `relatorioindi.astro` |
| 19   | Deprecate old components  | `Headerusuario.astro`, `Sidebarusuario.astro`                     |
| 20   | Test responsive design    | Mobile, tablet, desktop                                           |
| 21   | Test auth flow            | Login, logout, redirect                                           |
| 22   | Test API integration      | All endpoints                                                     |

---

## 7. Files to Modify

| File                                        | Changes Required                       |
| ------------------------------------------- | -------------------------------------- |
| `src/pages/responsavel/index.astro`         | Replace with Svelte layout integration |
| `src/pages/responsavel/presencafilho.astro` | Redirect to index or remove            |
| `src/pages/responsavel/comunicacao.astro`   | Redirect to index or remove            |
| `src/pages/responsavel/relatorioindi.astro` | Redirect to index or remove            |
| `src/lib/api.ts`                            | Add responsável-specific API functions |

### Deprecation Candidates

| File                                  | Reason                                  |
| ------------------------------------- | --------------------------------------- |
| `src/components/Sidebarusuario.astro` | Replaced by `ResponsavelSidebar.svelte` |
| `src/components/Headerusuario.astro`  | Replaced by `ResponsavelHeader.svelte`  |

---

## 8. Migration Strategy

### Option A: Full Svelte Migration (Recommended ✓)

**Pros:**
- Consistent with Admin portal pattern
- Better state management
- Single entry point, cleaner routing
- Easier to maintain

**Cons:**
- Requires more initial work
- Old pages need to be removed/redirected

**Implementation:**
1. Create all Svelte components
2. Update `index.astro` to render `ResponsavelLayout`
3. Remove or redirect individual section pages

### Option B: Hybrid Approach

**Pros:**
- Gradual migration
- Can test incrementally

**Cons:**
- More files to maintain
- Inconsistent patterns
- State management complexity

**Implementation:**
1. Keep Astro pages as shells
2. Embed Svelte components for interactive sections
3. Gradually migrate to full Svelte

---

## 9. Directory Structure (Final)

```
src/
├── components/
│   └── responsavel/
│       ├── ResponsavelLayout.svelte
│       ├── ResponsavelHeader.svelte
│       ├── ResponsavelSidebar.svelte
│       └── sections/
│           ├── PresencasFilho.svelte
│           ├── Comunicacao.svelte
│           └── RelatorioIndividual.svelte
├── stores/
│   ├── auth.ts (existing)
│   ├── adminNavigation.ts (existing)
│   └── responsavelNavigation.ts (new)
├── pages/
│   └── responsavel/
│       └── index.astro (updated)
└── lib/
    └── api.ts (updated with new functions)
```

---

## 10. Testing Checklist

### Authentication
- [ ] Login flow works for `responsavel` user type
- [ ] Redirect to `/login` if not authenticated
- [ ] Redirect to appropriate portal based on user type
- [ ] Logout works with confirmation
- [ ] Session persistence works

### Navigation
- [ ] Sidebar navigation works
- [ ] Active state displays correctly
- [ ] Section content updates on navigation

### Presenças Section
- [ ] Period selector works (7/15/30/custom)
- [ ] Custom date range picker shows/hides
- [ ] Stats cards display correct values
- [ ] Frequency bar animates correctly
- [ ] History table populates
- [ ] Empty state displays when no data

### Communication Section
- [ ] Tab navigation works
- [ ] Messages list displays correctly
- [ ] Notices list displays correctly
- [ ] Send message form validates
- [ ] Success feedback shows after send
- [ ] Urgency badges display correctly

### Reports Section
- [ ] Period selector works
- [ ] Statistics calculate correctly
- [ ] Child info displays correctly
- [ ] Weekly chart renders
- [ ] History table populates
- [ ] PDF export button works (or shows placeholder)

### Responsive Design
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Sidebar collapses on mobile

### API Integration
- [ ] All endpoints return expected data
- [ ] Error handling works
- [ ] Loading states display
- [ ] Token refresh works

---

## 11. Estimated Timeline

| Phase                  | Duration  | Dependencies         |
| ---------------------- | --------- | -------------------- |
| Phase 1: Foundation    | 2-3 hours | None                 |
| Phase 2: Presences     | 3-4 hours | Phase 1, Backend API |
| Phase 3: Communication | 3-4 hours | Phase 1, Backend API |
| Phase 4: Reports       | 2-3 hours | Phase 1, Backend API |
| Phase 5: Cleanup       | 1-2 hours | Phases 1-4           |

**Total Estimated Time:** 11-16 hours

---

## 12. Notes & Considerations

### Backend Dependencies
- Ensure backend has endpoints for:
  - Child attendance by guardian
  - Messages for guardian
  - Notices (public)
  - Child information linked to guardian

### User Experience
- Loading states for all data fetches
- Error messages for failed operations
- Success feedback for actions
- Smooth transitions between sections

### Security
- Verify user type before showing portal
- Ensure guardian can only see their own children's data
- Validate all form inputs
- Sanitize message content

### Accessibility
- Proper heading hierarchy
- Form labels linked to inputs
- Keyboard navigation support
- Color contrast compliance

---

## 13. References

- **Prototype:** `docs/prototipo/prototipousuario.html`
- **Admin Pattern:** `src/components/admin/`
- **Auth Store:** `src/stores/auth.ts`
- **API Library:** `src/lib/api.ts`
