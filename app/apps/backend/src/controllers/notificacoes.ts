import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, validateRequiredFields } from '../utils/validation';

const log = createControllerLogger('notificacoes');

type NotificacoesListQuery = {
    page?: string;
    pageSize?: string;
    responsavelId?: string;
    alunoId?: string;
    docenteId?: string;
    tipo?: string;
    canal?: string;
    entregue?: string;
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

async function ensureEntityExists(table: string, idColumn: string, idValue: number): Promise<boolean> {
    const { data, error } = await SupabaseWrapper.get()
        .from(table)
        .select(idColumn)
        .eq(idColumn, idValue)
        .maybeSingle();

    if (error) {
        log.error('ensureEntityExists', `Erro ao verificar entidade ${table}`, error);
        throw error;
    }

    return Boolean(data);
}

export default class NotificacaoController {
    static async getNotificacoes(req: Request<unknown, unknown, unknown, NotificacoesListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const {
                responsavelId,
                alunoId,
                docenteId,
                tipo,
                canal,
                entregue,
                from,
                to
            } = req.query;

            log.info('getNotificacoes', 'Listando notificações', {
                page,
                pageSize,
                responsavelId,
                alunoId,
                docenteId,
                tipo,
                canal,
                entregue,
                from,
                to
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('notificacoes')
                .select(`
                    id_notificacoes,
                    created_at,
                    id_responsavel,
                    id_aluno,
                    id_docente,
                    tipo_notifi,
                    canal_notifi,
                    mensagem_notifi,
                    entregue_notif,
                    data_envio,
                    responsaveis ( id_responsavel, nome_responsavel, telefone_responsavel, email_responsavel ),
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (responsavelId && isPositiveInteger(responsavelId)) {
                query = query.eq('id_responsavel', Number(responsavelId));
            }

            if (alunoId && isPositiveInteger(alunoId)) {
                query = query.eq('id_aluno', Number(alunoId));
            }

            if (docenteId && isPositiveInteger(docenteId)) {
                query = query.eq('id_docente', Number(docenteId));
            }

            if (tipo) {
                query = query.ilike('tipo_notifi', `%${tipo.trim()}%`);
            }

            if (canal) {
                query = query.ilike('canal_notifi', `%${canal.trim()}%`);
            }

            if (entregue === 'true') {
                query = query.eq('entregue_notif', true);
            } else if (entregue === 'false') {
                query = query.eq('entregue_notif', false);
            }

            if (from && isValidDateString(from)) {
                query = query.gte('created_at', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('created_at', new Date(to).toISOString());
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getNotificacoes', 'Erro ao buscar notificações', error);
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
            log.error('getNotificacoes', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getNotificacaoById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .select(`
                    id_notificacoes,
                    created_at,
                    id_responsavel,
                    id_aluno,
                    id_docente,
                    tipo_notifi,
                    canal_notifi,
                    mensagem_notifi,
                    entregue_notif,
                    data_envio,
                    responsaveis ( id_responsavel, nome_responsavel, telefone_responsavel, email_responsavel ),
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `)
                .eq('id_notificacoes', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getNotificacaoById', 'Erro ao buscar notificação', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Notificação não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getNotificacaoById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createNotificacao(req: Request, res: Response): Promise<Response | void> {
        try {
            const {
                id_responsavel,
                id_aluno,
                id_docente,
                tipo_notifi,
                canal_notifi,
                mensagem_notifi
            } = req.body;

            log.info('createNotificacao', 'Criando notificação', {
                id_responsavel,
                id_aluno,
                id_docente,
                tipo_notifi,
                canal_notifi
            });

            // Validate required fields
            const requiredFields = ['id_responsavel', 'tipo_notifi', 'canal_notifi', 'mensagem_notifi'];
            const missingFields = validateRequiredFields(req.body, requiredFields);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios faltando',
                    fields: missingFields
                });
            }

            // Validate IDs
            if (!isPositiveInteger(String(id_responsavel))) {
                return res.status(400).json({
                    error: 'ID do responsável inválido'
                });
            }

            // Check if responsavel exists
            const responsavelExists = await ensureEntityExists('responsaveis', 'id_responsavel', Number(id_responsavel));
            if (!responsavelExists) {
                return res.status(404).json({
                    error: 'Responsável não encontrado'
                });
            }

            // Optional: validate aluno if provided
            if (id_aluno) {
                if (!isPositiveInteger(String(id_aluno))) {
                    return res.status(400).json({
                        error: 'ID do aluno inválido'
                    });
                }
                const alunoExists = await ensureEntityExists('alunos', 'id_aluno', Number(id_aluno));
                if (!alunoExists) {
                    return res.status(404).json({
                        error: 'Aluno não encontrado'
                    });
                }
            }

            // Optional: validate docente if provided
            if (id_docente) {
                if (!isPositiveInteger(String(id_docente))) {
                    return res.status(400).json({
                        error: 'ID do docente inválido'
                    });
                }
                const docenteExists = await ensureEntityExists('docentes', 'id_docente', Number(id_docente));
                if (!docenteExists) {
                    return res.status(404).json({
                        error: 'Docente não encontrado'
                    });
                }
            }

            // Validate tipo_notifi
            const validTipos = ['falta', 'advertencia', 'comunicado', 'justificativa', 'geral'];
            if (!validTipos.includes(tipo_notifi.toLowerCase())) {
                return res.status(400).json({
                    error: 'Tipo de notificação inválido',
                    validTypes: validTipos
                });
            }

            // Validate canal_notifi
            const validCanais = ['whatsapp', 'email', 'sistema'];
            if (!validCanais.includes(canal_notifi.toLowerCase())) {
                return res.status(400).json({
                    error: 'Canal de notificação inválido',
                    validChannels: validCanais
                });
            }

            const notificacaoData = {
                id_responsavel: Number(id_responsavel),
                id_aluno: id_aluno ? Number(id_aluno) : null,
                id_docente: id_docente ? Number(id_docente) : null,
                tipo_notifi: tipo_notifi.toLowerCase(),
                canal_notifi: canal_notifi.toLowerCase(),
                mensagem_notifi: mensagem_notifi.trim(),
                entregue_notif: canal_notifi.toLowerCase() === 'sistema', // Sistema messages are instant
                data_envio: new Date().toISOString()
            };

            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .insert(notificacaoData)
                .select()
                .single();

            if (error) {
                log.error('createNotificacao', 'Erro ao criar notificação', error);
                return res.status(500).json({
                    error: 'Erro ao criar notificação',
                    details: error.message
                });
            }

            log.info('createNotificacao', 'Notificação criada com sucesso', { id: data.id_notificacoes });

            return res.status(201).json({
                success: true,
                data,
                message: 'Notificação criada com sucesso'
            });
        } catch (error) {
            log.error('createNotificacao', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateNotificacao(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { entregue_notif, mensagem_notifi } = req.body;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('updateNotificacao', 'Atualizando notificação', { id, entregue_notif, mensagem_notifi });

            // Check if notification exists
            const { data: existing, error: fetchError } = await SupabaseWrapper.get()
                .from('notificacoes')
                .select('id_notificacoes')
                .eq('id_notificacoes', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateNotificacao', 'Erro ao buscar notificação', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            }

            if (!existing) {
                return res.status(404).json({
                    error: 'Notificação não encontrada'
                });
            }

            const updateData: Record<string, unknown> = {};

            if (typeof entregue_notif === 'boolean') {
                updateData.entregue_notif = entregue_notif;
            }

            if (mensagem_notifi && typeof mensagem_notifi === 'string') {
                updateData.mensagem_notifi = mensagem_notifi.trim();
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar fornecido'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .update(updateData)
                .eq('id_notificacoes', Number(id))
                .select()
                .single();

            if (error) {
                log.error('updateNotificacao', 'Erro ao atualizar notificação', error);
                return res.status(500).json({
                    error: 'Erro ao atualizar notificação',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Notificação atualizada com sucesso'
            });
        } catch (error) {
            log.error('updateNotificacao', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteNotificacao(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('deleteNotificacao', 'Deletando notificação', { id });

            // Check if notification exists
            const { data: existing, error: fetchError } = await SupabaseWrapper.get()
                .from('notificacoes')
                .select('id_notificacoes')
                .eq('id_notificacoes', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteNotificacao', 'Erro ao buscar notificação', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            }

            if (!existing) {
                return res.status(404).json({
                    error: 'Notificação não encontrada'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .delete()
                .eq('id_notificacoes', Number(id));

            if (error) {
                log.error('deleteNotificacao', 'Erro ao deletar notificação', error);
                return res.status(500).json({
                    error: 'Erro ao deletar notificação',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Notificação deletada com sucesso'
            });
        } catch (error) {
            log.error('deleteNotificacao', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // Get responsaveis for a specific aluno (helper for the UI)
    static async getResponsaveisByAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { alunoId } = req.params;

            if (!isPositiveInteger(alunoId)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            log.info('getResponsaveisByAluno', 'Buscando responsáveis do aluno', { alunoId });

            const { data, error } = await SupabaseWrapper.get()
                .from('responsaveis_por_alunos')
                .select(`
                    id_responsaveis_por_alunos,
                    parentesco,
                    responsaveis (
                        id_responsavel,
                        nome_responsavel,
                        telefone_responsavel,
                        email_responsavel
                    )
                `)
                .eq('id_aluno', Number(alunoId));

            if (error) {
                log.error('getResponsaveisByAluno', 'Erro ao buscar responsáveis', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Flatten the response and include parentesco
            const responsaveis = (data || [])
                .map(item => ({
                    ...(item.responsaveis as object),
                    parentesco: item.parentesco
                }))
                .filter(Boolean);

            return res.status(200).json({
                success: true,
                data: responsaveis
            });
        } catch (error) {
            log.error('getResponsaveisByAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

// Controller export for the router registration
export const notificacaoController: EndpointController = {
    name: 'notificacoes',
    routes: {
        'listar': [{ key: RequestType.GET, value: NotificacaoController.getNotificacoes }],
        'buscar/:id': [{ key: RequestType.GET, value: NotificacaoController.getNotificacaoById }],
        'criar': [{ key: RequestType.POST, value: NotificacaoController.createNotificacao }],
        'atualizar/:id': [{ key: RequestType.PUT, value: NotificacaoController.updateNotificacao }],
        'deletar/:id': [{ key: RequestType.DELETE, value: NotificacaoController.deleteNotificacao }],
        'responsaveis-aluno/:alunoId': [{ key: RequestType.GET, value: NotificacaoController.getResponsaveisByAluno }]
    }
};
