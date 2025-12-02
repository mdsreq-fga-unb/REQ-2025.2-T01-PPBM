import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, validateRequiredFields } from '../utils/validation';

const log = createControllerLogger('acompanhamentos');

type AcompanhamentosListQuery = {
    page?: string;
    pageSize?: string;
    alunoId?: string;
    docenteId?: string;
    tipo?: string;
    from?: string;
    to?: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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

function isValidDateString(value: unknown): value is string {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }
    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
}

export default class AcompanhamentoController {
    /**
     * GET /acompanhamentos/listar
     * List accompaniment reports with optional filters
     */
    static async getAcompanhamentos(req: Request, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page as string, req.query.pageSize as string);
            const { alunoId, docenteId, tipo, from, to } = req.query as AcompanhamentosListQuery;

            log.info('getAcompanhamentos', 'Listando acompanhamentos', {
                page,
                pageSize,
                alunoId,
                docenteId,
                tipo,
                from,
                to
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            // Use explicit foreign key hints to avoid PostgREST ambiguity
            // (table has duplicate FK constraints for id_aluno and id_docente)
            let query = SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select(`
                    id_relatorios_acompanhamento,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_relatorio_acompanhamento,
                    data_relatorio_acompanhamento,
                    anexo_url,
                    tipo_relatorio,
                    id_responsavel,
                    alunos!relatorios_acompanhamentos_id_aluno_fkey ( id_aluno, nome_aluno ),
                    docentes!relatorios_acompanhamentos_id_docente_fkey ( id_docente, nome_docente ),
                    responsaveis ( id_responsavel, nome_responsavel )
                `, { count: 'exact' })
                .order('data_relatorio_acompanhamento', { ascending: false })
                .range(start, end);

            if (alunoId && isPositiveInteger(alunoId)) {
                query = query.eq('id_aluno', Number(alunoId));
            }

            if (docenteId && isPositiveInteger(docenteId)) {
                query = query.eq('id_docente', Number(docenteId));
            }

            if (tipo) {
                query = query.ilike('tipo_relatorio', `%${tipo.trim()}%`);
            }

            if (from && isValidDateString(from)) {
                query = query.gte('data_relatorio_acompanhamento', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('data_relatorio_acompanhamento', new Date(to).toISOString());
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getAcompanhamentos', 'Erro ao buscar acompanhamentos', error);
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
            log.error('getAcompanhamentos', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /acompanhamentos/detalhe/:id
     * Get a specific accompaniment report by ID
     */
    static async getAcompanhamentoById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            // Use explicit foreign key hints to avoid PostgREST ambiguity
            const { data, error } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select(`
                    id_relatorios_acompanhamento,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_relatorio_acompanhamento,
                    data_relatorio_acompanhamento,
                    anexo_url,
                    tipo_relatorio,
                    id_responsavel,
                    alunos!relatorios_acompanhamentos_id_aluno_fkey ( id_aluno, nome_aluno ),
                    docentes!relatorios_acompanhamentos_id_docente_fkey ( id_docente, nome_docente ),
                    responsaveis ( id_responsavel, nome_responsavel )
                `)
                .eq('id_relatorios_acompanhamento', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getAcompanhamentoById', 'Erro ao buscar acompanhamento', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Relatório de acompanhamento não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getAcompanhamentoById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /acompanhamentos/por-aluno/:id
     * Get all accompaniment reports for a specific student
     */
    static async getAcompanhamentosByAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            log.info('getAcompanhamentosByAluno', 'Buscando acompanhamentos do aluno', { alunoId: id });

            // Check if student exists
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, nome_aluno, neurodivergente')
                .eq('id_aluno', Number(id))
                .maybeSingle();

            if (alunoError) {
                log.error('getAcompanhamentosByAluno', 'Erro ao verificar aluno', alunoError);
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

            // Get accompaniment reports
            // Use explicit foreign key hint to avoid PostgREST ambiguity
            const { data, error } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select(`
                    id_relatorios_acompanhamento,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_relatorio_acompanhamento,
                    data_relatorio_acompanhamento,
                    anexo_url,
                    tipo_relatorio,
                    id_responsavel,
                    docentes!relatorios_acompanhamentos_id_docente_fkey ( id_docente, nome_docente )
                `)
                .eq('id_aluno', Number(id))
                .order('data_relatorio_acompanhamento', { ascending: false });

            if (error) {
                log.error('getAcompanhamentosByAluno', 'Erro ao buscar acompanhamentos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                aluno: {
                    id_aluno: aluno.id_aluno,
                    nome_aluno: aluno.nome_aluno,
                    neurodivergente: aluno.neurodivergente
                },
                data: data || [],
                total: data?.length || 0
            });
        } catch (error) {
            log.error('getAcompanhamentosByAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /acompanhamentos/criar
     * Create a new accompaniment report
     */
    static async createAcompanhamento(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['id_aluno', 'descricao_relatorio_acompanhamento']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.id_aluno)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            // Validate student exists
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, nome_aluno')
                .eq('id_aluno', Number(payload.id_aluno))
                .maybeSingle();

            if (alunoError || !aluno) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Validate docente if provided
            if (payload.id_docente !== undefined) {
                if (!isPositiveInteger(payload.id_docente)) {
                    return res.status(400).json({
                        error: 'ID do docente inválido'
                    });
                }

                const { data: docente, error: docenteError } = await SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .eq('id_docente', Number(payload.id_docente))
                    .maybeSingle();

                if (docenteError || !docente) {
                    return res.status(404).json({
                        error: 'Docente não encontrado'
                    });
                }
            }

            const insertPayload = {
                id_aluno: Number(payload.id_aluno),
                id_docente: payload.id_docente ? Number(payload.id_docente) : null,
                descricao_relatorio_acompanhamento: payload.descricao_relatorio_acompanhamento,
                data_relatorio_acompanhamento: isValidDateString(payload.data_relatorio_acompanhamento)
                    ? new Date(payload.data_relatorio_acompanhamento).toISOString()
                    : new Date().toISOString(),
                anexo_url: payload.anexo_url || null,
                tipo_relatorio: payload.tipo_relatorio || 'acompanhamento',
                id_responsavel: payload.id_responsavel ? Number(payload.id_responsavel) : null
            };

            log.info('createAcompanhamento', 'Criando acompanhamento', { alunoId: insertPayload.id_aluno });

            // Use explicit column selection to avoid PostgREST relationship ambiguity
            const { data, error } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .insert([insertPayload])
                .select('id_relatorios_acompanhamento, created_at, id_aluno, id_docente, descricao_relatorio_acompanhamento, data_relatorio_acompanhamento, anexo_url, tipo_relatorio, id_responsavel')
                .single();

            if (error) {
                log.error('createAcompanhamento', 'Erro ao criar acompanhamento', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Relatório de acompanhamento criado com sucesso'
            });
        } catch (error) {
            log.error('createAcompanhamento', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * PUT /acompanhamentos/atualizar/:id
     * Update an existing accompaniment report
     */
    static async updateAcompanhamento(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            // Check if record exists
            const { data: existing, error: fetchError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select('id_relatorios_acompanhamento')
                .eq('id_relatorios_acompanhamento', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateAcompanhamento', 'Erro ao buscar acompanhamento', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existing) {
                return res.status(404).json({
                    error: 'Relatório de acompanhamento não encontrado'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.descricao_relatorio_acompanhamento !== undefined) {
                updates.descricao_relatorio_acompanhamento = payload.descricao_relatorio_acompanhamento;
            }

            if (payload.data_relatorio_acompanhamento !== undefined) {
                if (!isValidDateString(payload.data_relatorio_acompanhamento)) {
                    return res.status(400).json({
                        error: 'Data do relatório inválida'
                    });
                }
                updates.data_relatorio_acompanhamento = new Date(payload.data_relatorio_acompanhamento).toISOString();
            }

            if (payload.tipo_relatorio !== undefined) {
                updates.tipo_relatorio = payload.tipo_relatorio;
            }

            if (payload.anexo_url !== undefined) {
                updates.anexo_url = payload.anexo_url;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            // Use explicit column selection to avoid PostgREST relationship ambiguity
            const { data, error } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .update(updates)
                .eq('id_relatorios_acompanhamento', Number(id))
                .select('id_relatorios_acompanhamento, created_at, id_aluno, id_docente, descricao_relatorio_acompanhamento, data_relatorio_acompanhamento, anexo_url, tipo_relatorio, id_responsavel')
                .single();

            if (error) {
                log.error('updateAcompanhamento', 'Erro ao atualizar acompanhamento', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Relatório de acompanhamento atualizado com sucesso'
            });
        } catch (error) {
            log.error('updateAcompanhamento', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * DELETE /acompanhamentos/deletar/:id
     * Delete an accompaniment report
     */
    static async deleteAcompanhamento(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            // Check if record exists
            const { data: existing, error: fetchError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select('id_relatorios_acompanhamento')
                .eq('id_relatorios_acompanhamento', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteAcompanhamento', 'Erro ao buscar acompanhamento', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existing) {
                return res.status(404).json({
                    error: 'Relatório de acompanhamento não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .delete()
                .eq('id_relatorios_acompanhamento', Number(id));

            if (error) {
                log.error('deleteAcompanhamento', 'Erro ao remover acompanhamento', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Relatório de acompanhamento removido com sucesso'
            });
        } catch (error) {
            log.error('deleteAcompanhamento', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const acompanhamentoController: EndpointController = {
    name: 'acompanhamentos',
    routes: {
        'listar': [
            { key: RequestType.GET, value: AcompanhamentoController.getAcompanhamentos }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: AcompanhamentoController.getAcompanhamentoById }
        ],
        'por-aluno/:id': [
            { key: RequestType.GET, value: AcompanhamentoController.getAcompanhamentosByAluno }
        ],
        'criar': [
            { key: RequestType.POST, value: AcompanhamentoController.createAcompanhamento }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: AcompanhamentoController.updateAcompanhamento }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: AcompanhamentoController.deleteAcompanhamento }
        ]
    }
};

export { acompanhamentoController };
