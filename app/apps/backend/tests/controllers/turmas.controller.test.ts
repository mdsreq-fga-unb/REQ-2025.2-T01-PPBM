import request from 'supertest';
import { createControllerApp } from '../helpers/controllerTestApp';
import { turmaController } from '../../src/controllers/turmas';
import { createSupabaseClientStub, createQueryBuilder } from '../mocks/supabaseClient';

const supabaseClientStub = createSupabaseClientStub();

jest.mock('../../src/utils/supabase_wrapper', () => ({
  SupabaseWrapper: {
    get: jest.fn(() => supabaseClientStub),
    init: jest.fn(),
  },
}));

import { SupabaseWrapper } from '../../src/utils/supabase_wrapper';

const app = createControllerApp(turmaController);

describe('TurmaController', () => {
  beforeEach(() => {
    supabaseClientStub.__reset();
    (SupabaseWrapper.get as jest.Mock).mockReturnValue(supabaseClientStub);
  });

  it('lists turmas', async () => {
    supabaseClientStub.__queue(
      'turmas',
      createQueryBuilder({
        data: [
          {
            id_turma: 1,
            nome_turma: 'Turma Alfa',
            limite_alunos_turma: 20,
          },
        ],
        count: 1,
        error: null,
      })
    );

    const response = await request(app).get('/turmas/listar');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].nome_turma).toBe('Turma Alfa');
  });

  it('creates turma successfully', async () => {
    supabaseClientStub.__queue(
      'turmas',
      createQueryBuilder({
        data: {
          id_turma: 2,
          nome_turma: 'Turma Beta',
          limite_alunos_turma: 25,
        },
        error: null,
      })
    );

    const response = await request(app)
      .post('/turmas/criar')
      .send({
        nome_turma: 'Turma Beta',
        limite_alunos_turma: 25,
        unidade_turma: 'Unidade Centro',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id_turma).toBe(2);
  });

  it('rejects capacity below current enrollment when updating', async () => {
    supabaseClientStub.__queue(
      'turmas',
      createQueryBuilder({
        data: {
          id_turma: 5,
          limite_alunos_turma: 30,
        },
        error: null,
      })
    );

    supabaseClientStub.__queue(
      'alunos_por_turma',
      createQueryBuilder({
        count: 28,
        error: null,
      })
    );

    const response = await request(app)
      .put('/turmas/atualizar/5')
      .send({
        limite_alunos_turma: 20,
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Limite de alunos inferior à quantidade atual de alunos matriculados');
  });
});



