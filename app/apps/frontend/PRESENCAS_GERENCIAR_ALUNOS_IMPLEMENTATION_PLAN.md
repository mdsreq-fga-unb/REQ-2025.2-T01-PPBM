# Implementation Plan: Presenças & Gerenciar Alunos

This document outlines the plan to integrate the `presencas.astro` and `gerenciar-alunos.astro` pages with the backend API.

---

## ✅ IMPLEMENTATION COMPLETE

**Completed on**: December 1, 2024

### Summary of Changes:

#### Backend Changes:
- ✅ Added `GET /turmas/:id/alunos` endpoint to `turmas.ts` controller
  - Returns turma info + list of enrolled students via `alunos_por_turma` join

#### gerenciar-alunos.astro:
- ✅ Dynamic turma loading from `/turmas/listar`
- ✅ Students loaded from `/alunos/listar` with filters
- ✅ Search with debounce (300ms)
- ✅ Pagination support
- ✅ Delete functionality via `/alunos/excluir/:id`
- ✅ CSV export with real data
- ✅ Stats cards (total alunos, neurodivergente count)
- ✅ Edit button links to `/admin/cadastrar-alunos?id=:id`

#### presencas.astro:
- ✅ Dynamic turma loading from `/turmas/listar`
- ✅ Students loaded from `/turmas/:id/alunos`
- ✅ Existing presences loaded from `/presencas/listar`
- ✅ Date picker with today as default
- ✅ Status selection (Presente, Atraso, Falta) with visual styling
- ✅ Observations textarea per student
- ✅ Save presences via `/presencas/criar` or `/presencas/atualizar/:id`
- ✅ Real-time stats (Total, Presentes, Atrasos, Faltas)
- ✅ Loading states and error handling

---

## 📋 Original State (for reference)

### presencas.astro
- **Status**: ~~UI Mockup only~~ → **IMPLEMENTED**
- **Previous Issues** (now fixed):
  - ~~Turma dropdown is static (Turma A, B, C)~~ → Dynamic from API
  - ~~API calls to fetch students are commented out~~ → Working API integration
  - ~~Saving presences is not implemented~~ → Full CRUD support
  - ~~No real data loading~~ → Real data from backend

### gerenciar-alunos.astro
- **Status**: ~~UI Mockup only~~ → **IMPLEMENTED**
- **Previous Issues** (now fixed):
  - ~~Uses hardcoded `alunosExemplo` array~~ → Loads from API
  - ~~Turma dropdown is static~~ → Dynamic from API
  - ~~API calls for loading/deleting students are commented out~~ → Working
  - ~~Edit functionality not implemented~~ → Redirects to cadastrar-alunos with ID

---

## 🎯 Target Requirements

### Presenças Page (US-004, US-005)
| Requirement | Description |
|-------------|-------------|
| RF-004 | Gerenciar lançamento de presença - Registros de presença/falta com histórico |
| RF-005 | Consultar aluno - Filtrar histórico de presenças/faltas por aluno, período |

**Functional Requirements**:
1. Load turmas dynamically from `/turmas/listar`
2. When turma is selected, load students enrolled in that turma
3. Display current presence status for selected date
4. Allow setting presence status: Presente, Falta, Atraso
5. Add observations per student
6. Save presences to backend via `/presencas/criar` or `/presencas/atualizar/:id`
7. Show real-time stats (Total, Presentes, Atrasos, Faltas)

### Gerenciar Alunos Page (US-001, US-016)
| Requirement | Description |
|-------------|-------------|
| RF-001 | Gerenciar Aluno - Cadastro, edição, remoção |
| RF-016 | Consultar turma - Busca por nome, CPF, status |

**Functional Requirements**:
1. Load students from `/alunos/listar`
2. Load turmas for filter dropdown from `/turmas/listar`
3. Filter by: name, CPF, turma, special status (neurodivergente)
4. Display student list with: name, CPF, turma, responsável, status indicators
5. Edit student → redirect to edit page or modal
6. Delete student via `/alunos/deletar/:id`
7. Export to CSV functionality
8. Show stats (Total, Alertas Médicos, Acompanhamento Especial)

---

## 🔌 Backend API Endpoints Available

### Alunos Controller (`/alunos/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/alunos/listar` | GET | List students with pagination & filters |
| `/alunos/detalhe/:id` | GET | Get student by ID |
| `/alunos/criar` | POST | Create new student |
| `/alunos/atualizar/:id` | PUT | Update student |
| `/alunos/deletar/:id` | DELETE | Delete student |

**Query Parameters for `/alunos/listar`**:
- `page`, `pageSize` - Pagination
- `turmaId` - Filter by turma
- `unidade` - Filter by school/unit
- `cidade` - Filter by city
- `nome` - Filter by name (partial match)
- `neurodivergente` - Filter by neurodivergent status

### Turmas Controller (`/turmas/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/turmas/listar` | GET | List all turmas |
| `/turmas/detalhe/:id` | GET | Get turma by ID |
| `/turmas/:id/alunos` | GET | Get students in a turma |

### Presenças Controller (`/presencas/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/presencas/listar` | GET | List presences with filters |
| `/presencas/detalhe/:id` | GET | Get presence by ID |
| `/presencas/criar` | POST | Create presence record |
| `/presencas/atualizar/:id` | PUT | Update presence record |
| `/presencas/deletar/:id` | DELETE | Delete presence record |

**Query Parameters for `/presencas/listar`**:
- `page`, `pageSize` - Pagination
- `alunoId` - Filter by student
- `turmaId` - Filter by turma
- `docenteId` - Filter by teacher
- `status` - Filter by status (Presente, Falta, Atraso)
- `from`, `to` - Date range filter

**POST/PUT Body for `/presencas/criar`**:
```json
{
  "id_aluno": 1,
  "id_turma": 1,
  "status_presenca": "Presente|Falta|Atraso",
  "data_time_presenca": "2025-12-01T08:00:00Z",
  "id_docente": 1
}
```

---

## 🔨 Implementation Steps

### Phase 1: Presenças Page

#### Step 1.1: Load Turmas Dynamically
```javascript
// Replace static turma options with API call
async function carregarTurmas() {
    const response = await fetch(`${backendUrl}/turmas/listar`);
    const data = await response.json();
    // Populate turma dropdown
}
```

#### Step 1.2: Load Students by Turma
```javascript
// When turma is selected, load students
async function carregarAlunosDaTurma(turmaId) {
    const response = await fetch(`${backendUrl}/turmas/${turmaId}/alunos`);
    const data = await response.json();
    // Render student list with presence checkboxes
}
```

#### Step 1.3: Load Existing Presences for Date
```javascript
// Load existing presences for selected date and turma
async function carregarPresencasDoDia(turmaId, data) {
    const response = await fetch(
        `${backendUrl}/presencas/listar?turmaId=${turmaId}&from=${data}&to=${data}`
    );
    const data = await response.json();
    // Map presences to students
}
```

#### Step 1.4: Save Presences
```javascript
// Save or update presence records
async function salvarPresencas(presencas) {
    for (const presenca of presencas) {
        if (presenca.id_presenca) {
            // Update existing
            await fetch(`${backendUrl}/presencas/atualizar/${presenca.id_presenca}`, {
                method: 'PUT',
                body: JSON.stringify(presenca)
            });
        } else {
            // Create new
            await fetch(`${backendUrl}/presencas/criar`, {
                method: 'POST',
                body: JSON.stringify(presenca)
            });
        }
    }
}
```

### Phase 2: Gerenciar Alunos Page

#### Step 2.1: Load Turmas for Filter
```javascript
async function carregarTurmas() {
    const response = await fetch(`${backendUrl}/turmas/listar`);
    const data = await response.json();
    // Populate filter dropdown
}
```

#### Step 2.2: Load Students with Filters
```javascript
async function carregarAlunos(filtros) {
    const params = new URLSearchParams();
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.turmaId) params.append('turmaId', filtros.turmaId);
    if (filtros.neurodivergente) params.append('neurodivergente', filtros.neurodivergente);
    
    const response = await fetch(`${backendUrl}/alunos/listar?${params}`);
    const data = await response.json();
    // Render student list
}
```

#### Step 2.3: Delete Student
```javascript
async function excluirAluno(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        const response = await fetch(`${backendUrl}/alunos/deletar/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            // Reload list
            carregarAlunos(filtrosAtuais);
        }
    }
}
```

#### Step 2.4: Edit Student Redirect
```javascript
function editarAluno(id) {
    window.location.href = `/admin/editar-aluno/${id}`;
    // OR open modal with student data
}
```

---

## 🗂️ New Files/Changes Required

### Files to Modify:
1. **`presencas.astro`** - Full refactor to integrate with backend
2. **`gerenciar-alunos.astro`** - Full refactor to integrate with backend

### Backend Additions Needed:

#### 1. Get Students by Turma Endpoint
We need to add an endpoint to get students enrolled in a specific turma:

**File**: `app/apps/backend/src/controllers/turmas.ts`
```typescript
// GET /turmas/:id/alunos
static async getAlunosByTurma(req: Request, res: Response): Promise<Response | void> {
    const { id } = req.params;
    // Query alunos_por_turma join alunos
}
```

#### 2. Bulk Create/Update Presences
For efficiency, add a bulk operation endpoint:

**File**: `app/apps/backend/src/controllers/presencas.ts`
```typescript
// POST /presencas/lote
static async createPresencasBatch(req: Request, res: Response): Promise<Response | void> {
    const { presencas } = req.body; // Array of presence records
    // Upsert all presences for the day/turma
}
```

---

## 📊 Data Flow Diagrams

### Presenças Flow
```
User selects Turma
    ↓
Load turmas from /turmas/listar
    ↓
User selects Date
    ↓
Load students from /turmas/:id/alunos
    ↓
Load existing presences from /presencas/listar?turmaId=X&from=DATE&to=DATE
    ↓
Merge students + presences
    ↓
User marks Presente/Falta/Atraso
    ↓
Save via /presencas/criar or /presencas/atualizar/:id
```

### Gerenciar Alunos Flow
```
Page Load
    ↓
Load turmas for filter dropdown
    ↓
Load all students from /alunos/listar
    ↓
User applies filters (name, turma, status)
    ↓
Reload students with query params
    ↓
User clicks Edit → redirect/modal
User clicks Delete → confirm → /alunos/deletar/:id
User clicks Export → generate CSV from current data
```

---

## ✅ Acceptance Criteria

### Presenças Page
- [ ] Turma dropdown loads from API
- [ ] Selecting turma shows enrolled students
- [ ] Selecting date loads existing presences for that day
- [ ] Can mark students as Presente (✅), Falta (❌), Atraso (⏰)
- [ ] Can add observations per student
- [ ] Clicking "Salvar" persists data to backend
- [ ] Stats update in real-time (Total, Presentes, Atrasos, Faltas)
- [ ] Shows success/error messages

### Gerenciar Alunos Page
- [ ] Students load from API on page load
- [ ] Can filter by name/CPF (text search)
- [ ] Can filter by turma (dropdown)
- [ ] Can filter by special status (neurodivergente)
- [ ] Clicking "Editar" navigates to edit page
- [ ] Clicking "Excluir" shows confirmation and deletes
- [ ] CSV export works with current filtered data
- [ ] Stats show accurate counts
- [ ] Pagination works correctly

---

## 🚀 Implementation Order

1. **Backend**: Add `/turmas/:id/alunos` endpoint
2. **Backend**: Add `/presencas/lote` endpoint (optional, for efficiency)
3. **Frontend**: Refactor `gerenciar-alunos.astro`
4. **Frontend**: Refactor `presencas.astro`
5. **Testing**: Manual testing of all flows
6. **Polish**: Error handling, loading states, edge cases

---

## 📝 Notes

- All API calls should include proper error handling
- Loading states should be shown during API calls
- Authentication token should be included in headers
- Consider debouncing search inputs
- Consider caching turmas list (doesn't change often)
