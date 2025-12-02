import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, isValidCPF, sanitizeCPF, validateRequiredFields } from '../utils/validation';
import { registrarLog } from './logs';

const log = createControllerLogger('alunos');

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

            log.info('getAlunos', 'Listando alunos', {
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
                serie,
                escola_unidade,
                cidade,
                neurodivergente,
                updated_at
            `.replace(/\s+/g, ' ').trim();

            const innerJoinTurma = turmaId ? '!inner' : '';
            selectQuery += `, alunos_por_turma${innerJoinTurma}(id_turma, turmas(id_turma, nome_turma, unidade_turma))`;
            selectQuery += `, responsaveis_por_alunos(id_responsavel, responsaveis(id_responsavel, nome_responsavel, telefone_responsavel, email_responsavel))`;

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
                log.error('getAlunos', 'Erro ao buscar alunos', error);
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
            log.error('getAlunos', 'Erro inesperado', error as Error);
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

            log.info('getAlunoById', `Buscando aluno com ID: ${id}`);

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
                    serie,
                    escola_unidade,
                    cidade,
                    neurodivergente,
                    updated_at,
                    sexo,
                    alergias,
                    condicoes_medicas,
                    observacoes_neuro,
                    alunos_por_turma(id_turma)
                `)
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getAlunoById', 'Erro ao buscar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                log.warn('getAlunoById', `Aluno não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getAlunoById', 'Erro inesperado', error as Error);
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

            log.info('createAluno', 'Verificando CPF duplicado', { cpf: sanitizedCPF });

            const { data: existingAluno, error: existsError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno')
                .eq('cpf_aluno', sanitizedCPF)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                log.error('createAluno', 'Erro ao verificar CPF', existsError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: existsError.message
                });
            }

            if (existingAluno) {
                log.warn('createAluno', 'CPF já cadastrado', { cpf: sanitizedCPF });
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
                serie: payload.serie ?? null,
                escola_unidade: payload.escola_unidade ?? null,
                cidade: payload.cidade ?? null,
                neurodivergente: parsedNeurodivergente ?? false,
                sexo: payload.sexo ?? null,
                alergias: payload.alergias ?? null,
                condicoes_medicas: payload.condicoes_medicas ?? null,
                observacoes_neuro: payload.observacoes_neuro ?? null
            };

            log.info('createAluno', 'Criando aluno', { nome: insertPayload.nome_aluno });

            const { data, error } = await SupabaseWrapper.get()
                .from('alunos')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                log.error('createAluno', 'Erro ao criar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            await registrarLog({
                acao: 'aluno_criado',
                descricao: `Aluno "${data.nome_aluno}" foi cadastrado no sistema`,
                entidade_tipo: 'aluno',
                entidade_id: data.id_aluno,
                dados_adicionais: { nome_aluno: data.nome_aluno }
            });

            return res.status(201).json({
                success: true,
                data,
                message: 'Aluno criado com sucesso'
            });
        } catch (error) {
            log.error('createAluno', 'Erro inesperado', error as Error);
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

            log.info('updateAluno', 'Atualizando aluno', { id });

            const { data: existingAluno, error: fetchError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, cpf_aluno')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateAluno', 'Erro ao buscar aluno', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingAluno) {
                log.warn('updateAluno', 'Aluno não encontrado', { id });
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

            if (payload.serie !== undefined) {
                updates.serie = payload.serie;
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

            if (payload.sexo !== undefined) {
                updates.sexo = payload.sexo;
            }

            if (payload.alergias !== undefined) {
                updates.alergias = payload.alergias;
            }

            if (payload.condicoes_medicas !== undefined) {
                updates.condicoes_medicas = payload.condicoes_medicas;
            }

            if (payload.observacoes_neuro !== undefined) {
                updates.observacoes_neuro = payload.observacoes_neuro;
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
                    log.error('updateAluno', 'Erro ao verificar CPF', cpfError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: cpfError.message
                    });
                }

                if (cpfOwner) {
                    log.warn('updateAluno', 'CPF já utilizado', { cpf: sanitizedCPF, conflictingId: cpfOwner.id_aluno });
                    return res.status(409).json({
                        error: 'Já existe um aluno com este CPF'
                    });
                }

                updates.cpf_aluno = sanitizedCPF;
            }

            // Update turma association if provided
            if (payload.turma_id !== undefined) {
                const turmaId = payload.turma_id ? Number(payload.turma_id) : null;

                if (turmaId) {
                    // Check if turma exists
                    const { data: turmaExists, error: turmaCheckError } = await SupabaseWrapper.get()
                        .from('turmas')
                        .select('id_turma')
                        .eq('id_turma', turmaId)
                        .maybeSingle();

                    if (turmaCheckError) {
                        log.error('updateAluno', 'Erro ao verificar turma', turmaCheckError);
                        return res.status(500).json({
                            error: 'Erro interno do servidor',
                            details: turmaCheckError.message
                        });
                    }

                    if (!turmaExists) {
                        return res.status(400).json({
                            error: 'Turma não encontrada'
                        });
                    }

                    // Delete existing association
                    await SupabaseWrapper.get()
                        .from('alunos_por_turma')
                        .delete()
                        .eq('id_aluno', Number(id));

                    // Create new association
                    const { error: turmaError } = await SupabaseWrapper.get()
                        .from('alunos_por_turma')
                        .insert({
                            id_aluno: Number(id),
                            id_turma: turmaId
                        });

                    if (turmaError) {
                        log.error('updateAluno', 'Erro ao atualizar turma do aluno', turmaError);
                        return res.status(500).json({
                            error: 'Erro interno do servidor',
                            details: turmaError.message
                        });
                    }
                } else {
                    // Remove turma association
                    await SupabaseWrapper.get()
                        .from('alunos_por_turma')
                        .delete()
                        .eq('id_aluno', Number(id));
                }
            }

            // Update responsaveis associations if provided
            if (payload.responsaveis !== undefined) {
                const responsaveis = payload.responsaveis as Array<{
                    id_responsavel: number;
                    parentesco?: string;
                }>;

                log.info('updateAluno', 'Atualizando responsáveis do aluno', {
                    alunoId: id,
                    responsaveisCount: responsaveis?.length || 0
                });

                // Delete existing responsaveis associations
                const { error: deleteRespError } = await SupabaseWrapper.get()
                    .from('responsaveis_por_alunos')
                    .delete()
                    .eq('id_aluno', Number(id));

                if (deleteRespError) {
                    log.error('updateAluno', 'Erro ao remover responsáveis existentes', deleteRespError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: deleteRespError.message
                    });
                }

                // Create new associations for each responsavel
                if (responsaveis && responsaveis.length > 0) {
                    for (const resp of responsaveis) {
                        if (!resp.id_responsavel) {
                            log.warn('updateAluno', 'Responsável sem ID, ignorando');
                            continue;
                        }

                        // Verify responsavel exists
                        const { data: respExists, error: respCheckError } = await SupabaseWrapper.get()
                            .from('responsaveis')
                            .select('id_responsavel')
                            .eq('id_responsavel', resp.id_responsavel)
                            .maybeSingle();

                        if (respCheckError) {
                            log.error('updateAluno', 'Erro ao verificar responsável', respCheckError);
                            continue;
                        }

                        if (!respExists) {
                            log.warn('updateAluno', 'Responsável não encontrado', { id_responsavel: resp.id_responsavel });
                            continue;
                        }

                        // Create the link
                        const { error: linkError } = await SupabaseWrapper.get()
                            .from('responsaveis_por_alunos')
                            .insert({
                                id_aluno: Number(id),
                                id_responsavel: resp.id_responsavel,
                                parentesco: resp.parentesco || null
                            });

                        if (linkError) {
                            log.error('updateAluno', 'Erro ao vincular responsável', linkError);
                            // Continue to try other responsaveis
                        } else {
                            log.info('updateAluno', 'Responsável vinculado com sucesso', {
                                alunoId: id,
                                responsavelId: resp.id_responsavel
                            });
                        }
                    }
                }
            }

            if (Object.keys(updates).length === 1) {
                // only updated_at present, but we might have updated turma or responsaveis
                if (payload.turma_id === undefined && payload.responsaveis === undefined) {
                    return res.status(400).json({
                        error: 'Nenhum campo para atualizar'
                    });
                }
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('alunos')
                .update(updates)
                .eq('id_aluno', Number(id))
                .select()
                .single();

            if (error) {
                log.error('updateAluno', 'Erro ao atualizar aluno', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            await registrarLog({
                acao: 'aluno_atualizado',
                descricao: `Aluno "${data.nome_aluno}" foi atualizado`,
                entidade_tipo: 'aluno',
                entidade_id: data.id_aluno,
                dados_adicionais: { nome_aluno: data.nome_aluno }
            });

            return res.status(200).json({
                success: true,
                data,
                message: 'Aluno atualizado com sucesso'
            });
        } catch (error) {
            log.error('updateAluno', 'Erro inesperado', error as Error);
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

            log.info('deleteAluno', 'Removendo aluno', { id });

            const { data: existingAluno, error: fetchError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteAluno', 'Erro ao buscar aluno', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingAluno) {
                log.warn('deleteAluno', 'Aluno não encontrado', { id });
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('alunos')
                .delete()
                .eq('id_aluno', Number(id));

            if (error) {
                log.error('deleteAluno', 'Erro ao remover aluno', error);
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
            log.error('deleteAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /alunos/historico/:id
     * Get complete timeline for a student (presenças, justificativas, advertências)
     */
    static async getHistoricoAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { from, to, tipo } = req.query as { from?: string; to?: string; tipo?: string };

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getHistoricoAluno', `Buscando histórico do aluno: ${id}`, { from, to, tipo });

            // Check if student exists
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, nome_aluno, cpf_aluno, neurodivergente')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (alunoError) {
                log.error('getHistoricoAluno', 'Erro ao buscar aluno', alunoError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: alunoError.message
                });
            }

            if (!aluno) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Build date filters
            const fromDate = from ? new Date(from).toISOString() : undefined;
            const toDate = to ? new Date(to).toISOString() : undefined;

            // Fetch all events in parallel
            const tiposFilter = tipo ? tipo.split(',') : ['presenca', 'justificativa', 'advertencia'];

            const promises: Promise<any>[] = [];

            // Presenças
            if (tiposFilter.includes('presenca')) {
                let presencaQuery = SupabaseWrapper.get()
                    .from('presencas')
                    .select(`
                        id_presenca,
                        created_at,
                        data_time_presenca,
                        status_presenca,
                        id_turma,
                        id_docente,
                        id_justificativa,
                        turmas ( nome_turma ),
                        docentes ( nome_docente )
                    `)
                    .eq('id_aluno', Number(id))
                    .order('data_time_presenca', { ascending: false });

                if (fromDate) {
                    presencaQuery = presencaQuery.gte('data_time_presenca', fromDate);
                }
                if (toDate) {
                    presencaQuery = presencaQuery.lte('data_time_presenca', toDate);
                }

                promises.push(Promise.resolve(presencaQuery).then(r => ({ type: 'presenca', ...r })));
            }

            // Justificativas
            if (tiposFilter.includes('justificativa')) {
                let justificativaQuery = SupabaseWrapper.get()
                    .from('justificativa')
                    .select(`
                        id_justificativa,
                        created_at,
                        motivo_justificativa,
                        anexo_url,
                        aprovado_por_docente_justificativa,
                        id_docente,
                        docentes ( nome_docente )
                    `)
                    .eq('id_aluno', Number(id))
                    .order('created_at', { ascending: false });

                if (fromDate) {
                    justificativaQuery = justificativaQuery.gte('created_at', fromDate);
                }
                if (toDate) {
                    justificativaQuery = justificativaQuery.lte('created_at', toDate);
                }

                promises.push(Promise.resolve(justificativaQuery).then(r => ({ type: 'justificativa', ...r })));
            }

            // Advertências
            if (tiposFilter.includes('advertencia')) {
                let advertenciaQuery = SupabaseWrapper.get()
                    .from('advertencias')
                    .select(`
                        id_advertencia,
                        created_at,
                        descricao_advertencia,
                        id_docente,
                        docentes ( nome_docente )
                    `)
                    .eq('id_aluno', Number(id))
                    .order('created_at', { ascending: false });

                if (fromDate) {
                    advertenciaQuery = advertenciaQuery.gte('created_at', fromDate);
                }
                if (toDate) {
                    advertenciaQuery = advertenciaQuery.lte('created_at', toDate);
                }

                promises.push(Promise.resolve(advertenciaQuery).then(r => ({ type: 'advertencia', ...r })));
            }

            const results = await Promise.all(promises);

            // Check for errors
            for (const result of results) {
                if (result.error) {
                    log.error('getHistoricoAluno', `Erro ao buscar ${result.type}`, result.error);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: result.error.message
                    });
                }
            }

            // Build unified timeline
            const timeline: any[] = [];

            for (const result of results) {
                if (!result.data) continue;

                for (const item of result.data) {
                    let event: any = {
                        tipo: result.type,
                        id: null,
                        data: null,
                        descricao: null,
                        docente: null,
                        detalhes: {}
                    };

                    switch (result.type) {
                        case 'presenca':
                            const statusNormalized = String(item.status_presenca || '').toLowerCase();
                            event.id = item.id_presenca;
                            event.data = item.data_time_presenca || item.created_at;
                            event.descricao = `${statusNormalized === 'presente' ? 'Presença' : statusNormalized === 'atraso' ? 'Atraso' : 'Falta'} registrada`;
                            event.docente = item.docentes?.nome_docente || null;
                            event.detalhes = {
                                status: item.status_presenca,
                                turma: item.turmas?.nome_turma || null,
                                temJustificativa: !!item.id_justificativa
                            };
                            break;

                        case 'justificativa':
                            event.id = item.id_justificativa;
                            event.data = item.created_at;
                            event.descricao = item.motivo_justificativa;
                            event.docente = item.docentes?.nome_docente || null;
                            event.detalhes = {
                                aprovada: item.aprovado_por_docente_justificativa,
                                anexoUrl: item.anexo_url
                            };
                            break;

                        case 'advertencia':
                            event.id = item.id_advertencia;
                            event.data = item.created_at;
                            event.descricao = item.descricao_advertencia;
                            event.docente = item.docentes?.nome_docente || null;
                            event.detalhes = {};
                            break;
                    }

                    timeline.push(event);
                }
            }

            // Sort by date descending
            timeline.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

            return res.status(200).json({
                success: true,
                aluno: {
                    id_aluno: aluno.id_aluno,
                    nome_aluno: aluno.nome_aluno,
                    cpf_aluno: aluno.cpf_aluno,
                    neurodivergente: aluno.neurodivergente
                },
                timeline,
                total: timeline.length
            });
        } catch (error) {
            log.error('getHistoricoAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /alunos/estatisticas/:id
     * Get attendance statistics for a student
     */
    static async getEstatisticasAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { from, to } = req.query as { from?: string; to?: string };

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getEstatisticasAluno', `Buscando estatísticas do aluno: ${id}`, { from, to });

            // Check if student exists
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, nome_aluno, cpf_aluno, neurodivergente')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (alunoError) {
                log.error('getEstatisticasAluno', 'Erro ao buscar aluno', alunoError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: alunoError.message
                });
            }

            if (!aluno) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Build date filters
            const fromDate = from ? new Date(from).toISOString() : undefined;
            const toDate = to ? new Date(to).toISOString() : undefined;

            // Fetch presenças
            let presencaQuery = SupabaseWrapper.get()
                .from('presencas')
                .select('id_presenca, status_presenca, data_time_presenca')
                .eq('id_aluno', Number(id));

            if (fromDate) {
                presencaQuery = presencaQuery.gte('data_time_presenca', fromDate);
            }
            if (toDate) {
                presencaQuery = presencaQuery.lte('data_time_presenca', toDate);
            }

            const { data: presencas, error: presencaError } = await presencaQuery;

            if (presencaError) {
                log.error('getEstatisticasAluno', 'Erro ao buscar presenças', presencaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: presencaError.message
                });
            }

            // Fetch justificativas
            let justificativaQuery = SupabaseWrapper.get()
                .from('justificativa')
                .select('id_justificativa, aprovado_por_docente_justificativa, created_at')
                .eq('id_aluno', Number(id));

            if (fromDate) {
                justificativaQuery = justificativaQuery.gte('created_at', fromDate);
            }
            if (toDate) {
                justificativaQuery = justificativaQuery.lte('created_at', toDate);
            }

            const { data: justificativas, error: justificativaError } = await justificativaQuery;

            if (justificativaError) {
                log.error('getEstatisticasAluno', 'Erro ao buscar justificativas', justificativaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: justificativaError.message
                });
            }

            // Fetch advertências
            let advertenciaQuery = SupabaseWrapper.get()
                .from('advertencias')
                .select('id_advertencia, created_at')
                .eq('id_aluno', Number(id));

            if (fromDate) {
                advertenciaQuery = advertenciaQuery.gte('created_at', fromDate);
            }
            if (toDate) {
                advertenciaQuery = advertenciaQuery.lte('created_at', toDate);
            }

            const { data: advertencias, error: advertenciaError } = await advertenciaQuery;

            if (advertenciaError) {
                log.error('getEstatisticasAluno', 'Erro ao buscar advertências', advertenciaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: advertenciaError.message
                });
            }

            // Calculate statistics
            const presencasList = presencas || [];
            const justificativasList = justificativas || [];
            const advertenciasList = advertencias || [];

            const totalAulas = presencasList.length;
            // Normalize status to lowercase for comparison (database may store as 'Presente', 'Atraso', 'Falta')
            const presentes = presencasList.filter(p => String(p.status_presenca || '').toLowerCase() === 'presente').length;
            const atrasos = presencasList.filter(p => String(p.status_presenca || '').toLowerCase() === 'atraso').length;
            const faltas = presencasList.filter(p => {
                const status = String(p.status_presenca || '').toLowerCase();
                return status === 'falta' || status === 'ausente';
            }).length;

            const taxaPresenca = totalAulas > 0
                ? Math.round(((presentes + atrasos) / totalAulas) * 100)
                : 0;

            const justificativasAprovadas = justificativasList.filter(j => j.aprovado_por_docente_justificativa === true).length;
            const justificativasPendentes = justificativasList.filter(j => j.aprovado_por_docente_justificativa === null || j.aprovado_por_docente_justificativa === undefined).length;
            const justificativasRejeitadas = justificativasList.filter(j => j.aprovado_por_docente_justificativa === false).length;

            return res.status(200).json({
                success: true,
                aluno: {
                    id_aluno: aluno.id_aluno,
                    nome_aluno: aluno.nome_aluno,
                    cpf_aluno: aluno.cpf_aluno,
                    neurodivergente: aluno.neurodivergente
                },
                estatisticas: {
                    presenca: {
                        totalAulas,
                        presentes,
                        atrasos,
                        faltas,
                        taxaPresenca
                    },
                    justificativas: {
                        total: justificativasList.length,
                        aprovadas: justificativasAprovadas,
                        pendentes: justificativasPendentes,
                        rejeitadas: justificativasRejeitadas
                    },
                    advertencias: {
                        total: advertenciasList.length
                    }
                },
                periodo: {
                    from: fromDate || null,
                    to: toDate || null
                }
            });
        } catch (error) {
            log.error('getEstatisticasAluno', 'Erro inesperado', error as Error);
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
        'historico/:id': [
            { key: RequestType.GET, value: AlunoController.getHistoricoAluno }
        ],
        'estatisticas/:id': [
            { key: RequestType.GET, value: AlunoController.getEstatisticasAluno }
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


