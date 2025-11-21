# Controller Implementation Plan

This document outlines the recommended order and scope for implementing REST controllers in the backend, using `src/controllers/usuarios.ts` as a reference pattern. Priorities focus on unlocking core attendance workflows first, then expanding to complementary modules described in `database_schema.txt`.

## Prioritization Criteria
- **Operational Impact:** Tables that drive daily attendance, class, and personnel management take precedence.
- **Data Dependencies:** Controllers that provide foundational entities are built before those that depend on them.
- **Reuse & Consistency:** Follow the logging, validation, and Supabase access style used in `UsuarioController`.

## Controller Roadmap

| Priority | Controller | Primary Tables | Key Responsibilities |
| --- | --- | --- | --- |
| P0 | `alunos` | `alunos` | CRUD students, search/filter by class/unit, enforce unique CPF, expose neurodivergent flag. |
| P0 | `docentes` | `docentes` | CRUD teachers, lookup by unidade/cidade, ensure unique CPF/email. |
| P0 | `turmas` | `turmas` | CRUD classes, enforce capacity, list by unidade/cidade. |
| P0 | `presencas` | `presencas`, `alunos`, `turmas`, `justificativa` | Record attendance, update status, fetch by date/class/student, link to justificativas. |
| P1 | `justificativas` | `justificativa` | CRUD justification records, upload metadata, approval flow, attach to presenças. |
| P1 | `responsaveis` | `responsaveis` | CRUD guardians, enforce unique CPF/email, contact info updates. |
| P1 | `responsaveis-alunos` (sub-resource) | `responsaveis_por_alunos` | Manage guardian ↔ aluno relationships, bulk assign/remove. |
| P1 | `turmas-alunos` (sub-resource) | `alunos_por_turma` | Manage student enrollment per turma, respect turma capacity. |
| P1 | `turmas-docentes` (sub-resource) | `docentes_por_turma` | Assign docentes to turmas, prevent duplicates, list teaching staff. |
| P2 | `unidades` | `unidades` | CRUD training units, address details, lookup by city. |
| P2 | `turmas-unidades` (sub-resource) | `turmas_por_unidade` | Associate turmas with unidades, ensure consistency with turma.unidade_turma. |
| P2 | `docentes-unidades` (sub-resource) | `docentes_por_unidade` | Assign docentes to unidades, synchronize with unidade_docente. |
| P2 | `conteudos` | `conteudos_institucionais` | CRUD institutional content, category filtering, handle attachments. |
| P2 | `notificacoes` | `notificacoes` | CRUD notifications, filter by aluno/responsavel/status, delivery flag updates. |
| P3 | `relatorios` | `relatorios_acompanhamentos` | CRUD follow-up reports, filter by aluno/docente/responsavel, attachments. |
| P3 | `advertencias` | `advertencias` | CRUD warnings, link to aluno/docente, capture description & timestamps. |

## Implementation Notes

1. **Controller Skeleton:** For each new controller, replicate the structure from `usuarios.ts`: input validation, logging tags (`[controller][action]`), Supabase queries via `SupabaseWrapper`, and consistent error handling.
2. **Routing Registration:** Update `src/index.ts` (or the central router aggregator) to register each controller with the `EndpointController` interface, mirroring the existing `usuarioController`.
3. **Validation Helpers:** Consider extracting common validation (e.g., numeric ID checks, email/CPF format) into utility functions under `src/utils`.
4. **Pagination & Filtering:** For high-volume resources (`alunos`, `presencas`, `notificacoes`), plan for query parameters supporting pagination, filtering by related entity IDs, and date ranges.
5. **Transactional Integrity:** When manipulating join tables (e.g., `alunos_por_turma`), validate existence of related entities and enforce business rules such as turma capacity within the controller.
6. **Attachment Handling:** For tables storing `anexo_url`, standardize how URLs are validated or generated, possibly integrating with existing storage services.
7. **Testing Strategy:** As controllers are added, create or extend integration tests (e.g., via Jest + supertest) covering success paths, validation failures, and Supabase error propagation.

Deliverables should follow the priority tiers, ensuring P0 controllers are production-ready before advancing to subsequent groups.



