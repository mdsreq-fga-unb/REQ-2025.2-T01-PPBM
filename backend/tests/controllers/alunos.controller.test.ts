import request from 'supertest';
import { createControllerApp } from '../helpers/controllerTestApp';
import { alunoController } from '../../src/controllers/alunos';
import { createSupabaseClientStub, createQueryBuilder } from '../mocks/supabaseClient';

const supabaseClientStub = createSupabaseClientStub();

jest.mock('../../src/utils/supabase_wrapper', () => ({
  SupabaseWrapper: {
    get: jest.fn(() => supabaseClientStub),
    init: jest.fn(),
  },
}));

import { SupabaseWrapper } from '../../src/utils/supabase_wrapper';

const app = createControllerApp(alunoController);

describe('AlunoController', () => {
  beforeEach(() => {
    supabaseClientStub.__reset();
    (SupabaseWrapper.get as jest.Mock).mockReturnValue(supabaseClientStub);
  });

  it('lists alunos with pagination metadata', async () => {
    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: [
          {
            id_aluno: 1,
            nome_aluno: 'Alice',
            cpf_aluno: '12345678900',
            neurodivergente: false,
          },
        ],
        error: null,
        count: 1,
      })
    );

    const response = await request(app).get('/alunos/listar?page=1&pageSize=10');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      total: 1,
      page: 1,
      pageSize: 10,
    });
    expect(response.body.data[0].nome_aluno).toBe('Alice');
  });

  it('prevents creating aluno with duplicate CPF', async () => {
    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: { id_aluno: 99 },
        error: null,
      })
    );

    const response = await request(app)
      .post('/alunos/criar')
      .send({ nome_aluno: 'Bob', cpf_aluno: '52998224725' });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Já existe um aluno com este CPF');
  });

  it('creates aluno successfully', async () => {
    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: null,
        error: null,
      })
    );

    supabaseClientStub.__queue(
      'alunos',
      createQueryBuilder({
        data: {
          id_aluno: 10,
          nome_aluno: 'Carol',
          cpf_aluno: '52998224725',
        },
        error: null,
      })
    );

    const response = await request(app)
      .post('/alunos/criar')
      .send({ nome_aluno: 'Carol', cpf_aluno: '529.982.247-25' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Aluno criado com sucesso',
    });
    expect(response.body.data.id_aluno).toBe(10);
  });
});



