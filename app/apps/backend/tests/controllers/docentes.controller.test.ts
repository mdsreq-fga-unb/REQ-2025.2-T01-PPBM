import request from 'supertest';
import { createControllerApp } from '../helpers/controllerTestApp';
import { docenteController } from '../../src/controllers/docentes';
import { createSupabaseClientStub, createQueryBuilder } from '../mocks/supabaseClient';

const supabaseClientStub = createSupabaseClientStub();

jest.mock('../../src/utils/supabase_wrapper', () => ({
  SupabaseWrapper: {
    get: jest.fn(() => supabaseClientStub),
    init: jest.fn(),
  },
}));

import { SupabaseWrapper } from '../../src/utils/supabase_wrapper';

const app = createControllerApp(docenteController);

describe('DocenteController', () => {
  beforeEach(() => {
    supabaseClientStub.__reset();
    (SupabaseWrapper.get as jest.Mock).mockReturnValue(supabaseClientStub);
  });

  it('lists docentes with filters', async () => {
    supabaseClientStub.__queue(
      'docentes',
      createQueryBuilder({
        data: [
          {
            id_docente: 1,
            nome_docente: 'Prof. Ana',
            email_docente: 'ana@example.com',
            cpf_docente: '12345678900',
          },
        ],
        count: 1,
        error: null,
      })
    );

    const response = await request(app).get('/docentes/listar?cidade=Sao Paulo');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].nome_docente).toBe('Prof. Ana');
  });

  it('rejects docente creation with invalid email', async () => {
    const response = await request(app)
      .post('/docentes/criar')
      .send({ nome_docente: 'Joao', cpf_docente: '52998224725', email_docente: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email inválido');
  });

  it('creates docente when email and CPF are unique', async () => {
    // first check for CPF
    supabaseClientStub.__queue(
      'docentes',
      createQueryBuilder({
        data: null,
        error: null,
      })
    );
    // second check for email
    supabaseClientStub.__queue(
      'docentes',
      createQueryBuilder({
        data: null,
        error: null,
      })
    );
    // insert
    supabaseClientStub.__queue(
      'docentes',
      createQueryBuilder({
        data: {
          id_docente: 42,
          nome_docente: 'Joao',
          cpf_docente: '52998224725',
          email_docente: 'joao@example.com',
        },
        error: null,
      })
    );

    const response = await request(app)
      .post('/docentes/criar')
      .send({
        nome_docente: 'Joao',
        cpf_docente: '529.982.247-25',
        email_docente: 'joao@example.com',
        cidade_docente: 'Rio',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id_docente).toBe(42);
  });
});



