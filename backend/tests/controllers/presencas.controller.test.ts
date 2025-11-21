import request from 'supertest';
import { createControllerApp } from '../helpers/controllerTestApp';
import { presencaController } from '../../src/controllers/presencas';
import { createSupabaseClientStub, createQueryBuilder } from '../mocks/supabaseClient';

const supabaseClientStub = createSupabaseClientStub();

jest.mock('../../src/utils/supabase_wrapper', () => ({
  SupabaseWrapper: {
    get: jest.fn(() => supabaseClientStub),
    init: jest.fn(),
  },
}));

import { SupabaseWrapper } from '../../src/utils/supabase_wrapper';

const app = createControllerApp(presencaController);

describe('PresencaController', () => {
  beforeEach(() => {
    supabaseClientStub.__reset();
    (SupabaseWrapper.get as jest.Mock).mockReturnValue(supabaseClientStub);
  });

  it('lists presencas with related entities', async () => {
    supabaseClientStub.__queue(
      'presencas',
      createQueryBuilder({
        data: [
          {
            id_presenca: 1,
            id_aluno: 5,
            id_turma: 2,
            status_presenca: 'presente',
            alunos: { id_aluno: 5, nome_aluno: 'Aluno Teste' },
          },
        ],
        count: 1,
        error: null,
      })
    );

    const response = await request(app).get('/presencas/listar');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].status_presenca).toBe('presente');
  });

  it('requires mandatory fields on create', async () => {
    const response = await request(app).post('/presencas/criar').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campos obrigatórios ausentes');
  });

  it('returns 404 when aluno not found during creation', async () => {
    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: null,
        error: null,
      })
    );

    const response = await request(app)
      .post('/presencas/criar')
      .send({ id_aluno: 99, id_turma: 1, status_presenca: 'falta' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Aluno não encontrado');
  });

  it('creates presenca when relations exist', async () => {
    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: { id_aluno: 10 },
        error: null,
      })
    );
    supabaseClientStub.__queue(
      'turmas',
      createQueryBuilder({
        data: { id_turma: 3 },
        error: null,
      })
    );
    supabaseClientStub.__queue(
      'presencas',
      createQueryBuilder({
        data: {
          id_presenca: 50,
          id_aluno: 10,
          id_turma: 3,
          status_presenca: 'presente',
        },
        error: null,
      })
    );

    const response = await request(app)
      .post('/presencas/criar')
      .send({
        id_aluno: 10,
        id_turma: 3,
        status_presenca: 'presente',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id_presenca).toBe(50);
  });
});



