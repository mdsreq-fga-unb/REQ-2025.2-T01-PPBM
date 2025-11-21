import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import logger from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, isValidCPF, sanitizeCPF, validateRequiredFields } from '../utils/validation';

type ListQueryParams = {
    page?: string;
    pageSize?: string;
    turmaId?: string;
    unidade?: string;
    cidade?: string;
    nome?: string;
    neurodivergente?: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parseBooleanInput(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (['true', '1', 'yes', 'sim'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) {
            return false;
        }
    }

    if (typeof value === 'number') {
        if (value === 1) {
            return true;
        }

        if (value === 0) {
            return false;
        }
    }

    return undefined;
}

function parsePagination(page?: string, pageSize?: string): { page: number; pageSize: number } {
    let parsedPage = Number(page ?? DEFAULT_PAGE);
    let parsedPageSize = Number(pageSize ?? DEFAULT_PAGE_SIZE);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        parsedPage = DEFAULT_PAGE;
    }

    if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
        parsedPageSize = DEFAULT_PAGE_SIZE;
    }

    if (parsedPageSize > MAX_PAGE_SIZE) {
        parsedPageSize = MAX_PAGE_SIZE;
    }

    return { page: parsedPage, pageSize: parsedPageSize };
}

function parseNeurodivergente(value?: string): boolean | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
        return true;
    }

    if (normalized === 'false' || normalized === '0') {
        return false;
    }

    return undefined;
}

export default class AlunoController {
    static async getAlunos(req: Request<unknown, unknown, unknown, ListQueryParams>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { turmaId, unidade, cidade, nome } = req.query;
            const neurodivergente = parseNeurodivergente(req.query.neurodivergente);

            logger.info('[alunos][getAlunos] Listando alunos', {
                page,
                pageSize,
                turmaId,
                unidade,
                cidade,
                nome,
                neurodivergente
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let selectQuery = `
                id_aluno,
                created_at,
                nome_aluno,
                data_nascimento_aluno,
                cpf_aluno,
                tipo_sanguineo,
                nome_guerra,
                graduacao,
                escola_unidade,
                cidade,
                neurodivergente,
                updated_at
            `.replace(/\s+/g, ' ').trim();

            const innerJoinTurma = turmaId ? '!inner' : '';
            selectQuery += `, alunos_por_turma${innerJoinTurma}(id_turma)`;

            const queryBuilder = SupabaseWrapper.get()
                .from('alunos')
                .select(selectQuery, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (turmaId && isPositiveInteger(turmaId)) {
                queryBuilder.eq('alunos_por_turma.id_turma', Number(turmaId));
            }

            if (unidade) {
                queryBuilder.ilike('escola_unidade', `%${unidade.trim()}%`);
            }

            if (cidade) {
                queryBuilder.ilike('cidade', `%${cidade.trim()}%`);
            }

            if (nome) {
                queryBuilder.ilike('nome_aluno', `%${nome.trim()}%`);
            }

            if (typeof neurodivergente === 'boolean') {
                queryBuilder.eq('neurodivergente', neurodivergente);
            }

            const { data, error, count } = await queryBuilder;

            if (error) {
                logger.error('[alunos][getAlunos] Erro ao buscar alunos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data: data || [],
                total: count ?? data?.length ?? 0,
                page,
                pageSize
            });
        } catch (error) {
            logger.error('[alunos][getAlunos] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getAlunoById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            logger.info(`[alunos][getAlunoById] Buscando aluno com ID: ${id}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('alunos')
                .select(`
                    id_aluno,
                    created_at,
                    nome_aluno,
                    data_nascimento_aluno,
                    cpf_aluno,
                    tipo_sanguineo,
                    nome_guerra,
                    graduacao,
                    escola_unidade,
                    cidade,
                    neurodivergente,
                    updated_at,
                    alunos_por_turma(id_turma)
                `)
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (error) {
                logger.error('[alunos][getAlunoById] Erro ao buscar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                logger.warn(`[alunos][getAlunoById] Aluno não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            logger.error('[alunos][getAlunoById] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['nome_aluno', 'cpf_aluno']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            const sanitizedCPF = sanitizeCPF(payload.cpf_aluno);

            if (!isValidCPF(sanitizedCPF)) {
                return res.status(400).json({
                    error: 'CPF inválido'
                });
            }

            logger.info('[alunos][createAluno] Verificando CPF duplicado', { cpf: sanitizedCPF });

            const { data: existingAluno, error: existsError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno')
                .eq('cpf_aluno', sanitizedCPF)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                logger.error('[alunos][createAluno] Erro ao verificar CPF', existsError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: existsError.message
                });
            }

            if (existingAluno) {
                logger.warn('[alunos][createAluno] CPF já cadastrado', { cpf: sanitizedCPF });
                return res.status(409).json({
                    error: 'Já existe um aluno com este CPF'
                });
            }

            const parsedNeurodivergente = parseBooleanInput(payload.neurodivergente);

            if (payload.neurodivergente !== undefined && parsedNeurodivergente === undefined) {
                return res.status(400).json({
                    error: 'Valor inválido para neurodivergente'
                });
            }

            const insertPayload = {
                nome_aluno: payload.nome_aluno,
                data_nascimento_aluno: payload.data_nascimento_aluno ?? null,
                cpf_aluno: sanitizedCPF,
                tipo_sanguineo: payload.tipo_sanguineo ?? null,
                nome_guerra: payload.nome_guerra ?? null,
                graduacao: payload.graduacao ?? null,
                escola_unidade: payload.escola_unidade ?? null,
                cidade: payload.cidade ?? null,
                neurodivergente: parsedNeurodivergente ?? false
            };

            logger.info('[alunos][createAluno] Criando aluno', { nome: insertPayload.nome_aluno });

            const { data, error } = await SupabaseWrapper.get()
                .from('alunos')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                logger.error('[alunos][createAluno] Erro ao criar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Aluno criado com sucesso'
            });
        } catch (error) {
            logger.error('[alunos][createAluno] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            logger.info('[alunos][updateAluno] Atualizando aluno', { id });

            const { data: existingAluno, error: fetchError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, cpf_aluno')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[alunos][updateAluno] Erro ao buscar aluno', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingAluno) {
                logger.warn('[alunos][updateAluno] Aluno não encontrado', { id });
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            const updates: Record<string, unknown> = {
                updated_at: new Date().toISOString()
            };

            if (payload.nome_aluno !== undefined) {
                updates.nome_aluno = payload.nome_aluno;
            }

            if (payload.data_nascimento_aluno !== undefined) {
                updates.data_nascimento_aluno = payload.data_nascimento_aluno;
            }

            if (payload.tipo_sanguineo !== undefined) {
                updates.tipo_sanguineo = payload.tipo_sanguineo;
            }

            if (payload.nome_guerra !== undefined) {
                updates.nome_guerra = payload.nome_guerra;
            }

            if (payload.graduacao !== undefined) {
                updates.graduacao = payload.graduacao;
            }

            if (payload.escola_unidade !== undefined) {
                updates.escola_unidade = payload.escola_unidade;
            }

            if (payload.cidade !== undefined) {
                updates.cidade = payload.cidade;
            }

            if (payload.neurodivergente !== undefined) {
                const parsedNeurodivergente = parseBooleanInput(payload.neurodivergente);

                if (parsedNeurodivergente === undefined) {
                    return res.status(400).json({
                        error: 'Valor inválido para neurodivergente'
                    });
                }

                updates.neurodivergente = parsedNeurodivergente;
            }

            if (payload.cpf_aluno !== undefined) {
                const sanitizedCPF = sanitizeCPF(payload.cpf_aluno);

                if (!isValidCPF(sanitizedCPF)) {
                    return res.status(400).json({
                        error: 'CPF inválido'
                    });
                }

                const { data: cpfOwner, error: cpfError } = await SupabaseWrapper.get()
                    .from('alunos')
                    .select('id_aluno')
                    .eq('cpf_aluno', sanitizedCPF)
                    .neq('id_aluno', Number(id))
                    .maybeSingle();

                if (cpfError && cpfError.code !== 'PGRST116') {
                    logger.error('[alunos][updateAluno] Erro ao verificar CPF', cpfError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: cpfError.message
                    });
                }

                if (cpfOwner) {
                    logger.warn('[alunos][updateAluno] CPF já utilizado', { cpf: sanitizedCPF, conflictingId: cpfOwner.id_aluno });
                    return res.status(409).json({
                        error: 'Já existe um aluno com este CPF'
                    });
                }

                updates.cpf_aluno = sanitizedCPF;
            }

            if (Object.keys(updates).length === 1) {
                // only updated_at present
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('alunos')
                .update(updates)
                .eq('id_aluno', Number(id))
                .select()
                .single();

            if (error) {
                logger.error('[alunos][updateAluno] Erro ao atualizar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Aluno atualizado com sucesso'
            });
        } catch (error) {
            logger.error('[alunos][updateAluno] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            logger.info('[alunos][deleteAluno] Removendo aluno', { id });

            const { data: existingAluno, error: fetchError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[alunos][deleteAluno] Erro ao buscar aluno', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingAluno) {
                logger.warn('[alunos][deleteAluno] Aluno não encontrado', { id });
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('alunos')
                .delete()
                .eq('id_aluno', Number(id));

            if (error) {
                logger.error('[alunos][deleteAluno] Erro ao remover aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Aluno removido com sucesso'
            });
        } catch (error) {
            logger.error('[alunos][deleteAluno] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const alunoController: EndpointController = {
    name: 'alunos',
    routes: {
        'listar': [
            { key: RequestType.GET, value: AlunoController.getAlunos }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: AlunoController.getAlunoById }
        ],
        'criar': [
            { key: RequestType.POST, value: AlunoController.createAluno }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: AlunoController.updateAluno }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: AlunoController.deleteAluno }
        ]
    }
};

export { alunoController };


