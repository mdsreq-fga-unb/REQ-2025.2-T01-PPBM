import request from 'supertest';
import { app } from '../index';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { CadastroAlunoRequest } from '../interfaces/aluno';

// Mock do Supabase
jest.mock('../utils/supabase_wrapper');
const mockSupabase = SupabaseWrapper as jest.Mocked<typeof SupabaseWrapper>;

describe('AlunosController Integration Tests', () => {
    let mockSupabaseClient: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Mock do cliente Supabase
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn(),
            single: jest.fn()
        };

        mockSupabase.get.mockReturnValue(mockSupabaseClient);
    });

    describe('POST /alunos', () => {
        const validRequest: CadastroAlunoRequest = {
            aluno: {
                nome_aluno: 'João Silva',
                data_nascimento_aluno: '2010-05-15',
                cpf_aluno: '11144477735',
                tipo_sanguineo: 'O+',
                nome_guerra: 'João',
                graduacao: 'Soldado',
                escola_unidade: 'Escola Municipal',
                cidade: 'Brasília',
                neurodivergente: false
            },
            responsavel: {
                nome_responsavel: 'Maria Silva',
                telefone_responsavel: '61987654321',
                email_responsavel: 'maria@email.com',
                cpf_responsavel: '52998224725'
            }
        };

        it('should successfully create a new student with guardian', async () => {
            // Mock: Aluno não existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Mock: Responsável não existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Mock: Criação do responsável
            const mockResponsavel = {
                id_responsavel: 1,
                nome_responsavel: 'Maria Silva',
                telefone_responsavel: '61987654321',
                email_responsavel: 'maria@email.com',
                cpf_responsavel: '52998224725'
            };
            mockSupabaseClient.single.mockResolvedValueOnce({ data: mockResponsavel, error: null });
            
            // Mock: Criação do aluno
            const mockAluno = {
                id_aluno: 1,
                nome_aluno: 'João Silva',
                data_nascimento_aluno: '2010-05-15',
                cpf_aluno: '11144477735',
                tipo_sanguineo: 'O+',
                nome_guerra: 'João',
                graduacao: 'Soldado',
                escola_unidade: 'Escola Municipal',
                cidade: 'Brasília',
                neurodivergente: false
            };
            mockSupabaseClient.single.mockResolvedValueOnce({ data: mockAluno, error: null });
            
            // Mock: Criação do vínculo
            mockSupabaseClient.insert.mockResolvedValueOnce({ error: null });

            const response = await request(app)
                .post('/alunos')
                .send(validRequest)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Aluno cadastrado com sucesso');
            expect(response.body.data.aluno.nome_aluno).toBe('João Silva');
            expect(response.body.data.responsavel.nome_responsavel).toBe('Maria Silva');
        });

        it('should return 409 when CPF already exists', async () => {
            // Mock: Aluno já existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
                data: { id_aluno: 1, nome_aluno: 'João Existente' },
                error: null
            });

            const response = await request(app)
                .post('/alunos')
                .send(validRequest)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('CPF já cadastrado');
            expect(response.body.error).toContain('Já existe um aluno cadastrado com o CPF');
        });

        it('should return 400 for invalid CPF', async () => {
            const invalidRequest = {
                ...validRequest,
                aluno: {
                    ...validRequest.aluno,
                    cpf_aluno: '12345678901' // CPF inválido
                }
            };

            const response = await request(app)
                .post('/alunos')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Dados inválidos');
            expect(response.body.error).toContain('CPF do aluno é obrigatório e deve ser válido');
        });

        it('should return 400 for missing required fields', async () => {
            const invalidRequest = {
                aluno: {
                    nome_aluno: '',
                    data_nascimento_aluno: '',
                    cpf_aluno: ''
                },
                responsavel: {
                    nome_responsavel: ''
                }
            };

            const response = await request(app)
                .post('/alunos')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Dados inválidos');
            expect(response.body.error).toContain('Nome do aluno é obrigatório');
            expect(response.body.error).toContain('CPF do aluno é obrigatório e deve ser válido');
            expect(response.body.error).toContain('Data de nascimento do aluno é obrigatória e deve ser válida');
            expect(response.body.error).toContain('Nome do responsável é obrigatório');
        });

        it('should return 400 for invalid email format', async () => {
            const invalidRequest = {
                ...validRequest,
                responsavel: {
                    ...validRequest.responsavel,
                    email_responsavel: 'email-invalido'
                }
            };

            const response = await request(app)
                .post('/alunos')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Dados inválidos');
            expect(response.body.error).toContain('Email do responsável deve ser válido quando informado');
        });

        it('should return 400 for invalid phone format', async () => {
            const invalidRequest = {
                ...validRequest,
                responsavel: {
                    ...validRequest.responsavel,
                    telefone_responsavel: '123'
                }
            };

            const response = await request(app)
                .post('/alunos')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Dados inválidos');
            expect(response.body.error).toContain('Telefone do responsável deve ser válido quando informado');
        });

        it('should return 400 for invalid date format', async () => {
            const invalidRequest = {
                ...validRequest,
                aluno: {
                    ...validRequest.aluno,
                    data_nascimento_aluno: '15/05/2010' // Formato inválido
                }
            };

            const response = await request(app)
                .post('/alunos')
                .send(invalidRequest)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Dados inválidos');
            expect(response.body.error).toContain('Data de nascimento do aluno é obrigatória e deve ser válida');
        });

        it('should reuse existing guardian when CPF matches', async () => {
            // Mock: Aluno não existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Mock: Responsável já existe
            const existingResponsavel = {
                id_responsavel: 2,
                nome_responsavel: 'Maria Silva Existente',
                telefone_responsavel: '61987654321',
                email_responsavel: 'maria.existente@email.com',
                cpf_responsavel: '52998224725'
            };
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ 
                data: existingResponsavel, 
                error: null 
            });
            
            // Mock: Criação do aluno
            const mockAluno = {
                id_aluno: 1,
                nome_aluno: 'João Silva',
                cpf_aluno: '11144477735'
            };
            mockSupabaseClient.single.mockResolvedValueOnce({ data: mockAluno, error: null });
            
            // Mock: Criação do vínculo
            mockSupabaseClient.insert.mockResolvedValueOnce({ error: null });

            const response = await request(app)
                .post('/alunos')
                .send(validRequest)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.responsavel.id_responsavel).toBe(2);
            expect(response.body.data.responsavel.nome_responsavel).toBe('Maria Silva Existente');
        });

        it('should handle database errors gracefully', async () => {
            // Mock: Erro na busca do aluno
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
                data: null,
                error: { message: 'Database connection error' }
            });

            const response = await request(app)
                .post('/alunos')
                .send(validRequest)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Erro interno do servidor');
            expect(response.body.error).toBe('Erro ao verificar duplicidade de CPF');
        });

        it('should rollback student creation if guardian linking fails', async () => {
            // Mock: Aluno não existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Mock: Responsável não existe
            mockSupabaseClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Mock: Criação do responsável
            const mockResponsavel = { id_responsavel: 1 };
            mockSupabaseClient.single.mockResolvedValueOnce({ data: mockResponsavel, error: null });
            
            // Mock: Criação do aluno
            const mockAluno = { id_aluno: 1 };
            mockSupabaseClient.single.mockResolvedValueOnce({ data: mockAluno, error: null });
            
            // Mock: Erro na criação do vínculo
            mockSupabaseClient.insert.mockResolvedValueOnce({ 
                error: { message: 'Foreign key constraint error' } 
            });
            
            // Mock: Rollback - deletar aluno
            mockSupabaseClient.delete.mockResolvedValueOnce({ error: null });

            const response = await request(app)
                .post('/alunos')
                .send(validRequest)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Erro interno do servidor');
            expect(response.body.error).toBe('Erro ao vincular aluno ao responsável');
            
            // Verificar se o rollback foi chamado
            expect(mockSupabaseClient.delete).toHaveBeenCalledWith();
        });
    });
});