import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger } from '../utils/validation';

const log = createControllerLogger('logs');

// Log action types
export type LogAction = 
    | 'aluno_criado'
    | 'aluno_atualizado'
    | 'aluno_removido'
    | 'turma_criada'
    | 'turma_atualizada'
    | 'presenca_registrada'
    | 'advertencia_criada'
    | 'justificativa_criada'
    | 'justificativa_aprovada'
    | 'justificativa_rejeitada'
    | 'docente_criado'
    | 'docente_atualizado'
    | 'responsavel_criado'
    | 'notificacao_enviada'
    | 'documento_enviado'
    | 'conteudo_publicado'
    | 'acompanhamento_criado'
    | 'login_realizado'
    | 'usuario_cadastrado';

// Log entry interface
interface LogEntry {
    id_log?: number;
    created_at?: string;
    acao: LogAction;
    descricao: string;
    usuario_tipo?: 'admin' | 'docente' | 'responsavel' | null;
    usuario_email?: string | null;
    entidade_tipo?: string | null;
    entidade_id?: number | null;
    dados_adicionais?: Record<string, unknown> | null;
}

type LogsListQuery = {
    page?: string;
    pageSize?: string;
    acao?: string;
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

// Helper function to format log action for display
function formatLogAction(acao: LogAction): string {
    const actionLabels: Record<LogAction, string> = {
        'aluno_criado': '👶 Aluno cadastrado',
        'aluno_atualizado': '✏️ Aluno atualizado',
        'aluno_removido': '🗑️ Aluno removido',
        'turma_criada': '📚 Turma criada',
        'turma_atualizada': '✏️ Turma atualizada',
        'presenca_registrada': '✅ Presença registrada',
        'advertencia_criada': '⚠️ Advertência registrada',
        'justificativa_criada': '📝 Justificativa enviada',
        'justificativa_aprovada': '✅ Justificativa aprovada',
        'justificativa_rejeitada': '❌ Justificativa rejeitada',
        'docente_criado': '👨‍🏫 Docente cadastrado',
        'docente_atualizado': '✏️ Docente atualizado',
        'responsavel_criado': '👤 Responsável cadastrado',
        'notificacao_enviada': '📧 Notificação enviada',
        'documento_enviado': '📄 Documento enviado',
        'conteudo_publicado': '📰 Conteúdo publicado',
        'acompanhamento_criado': '📋 Acompanhamento registrado',
        'login_realizado': '🔐 Login realizado',
        'usuario_cadastrado': '👤 Usuário cadastrado'
    };
    return actionLabels[acao] || acao;
}

export default class LogsController {
    /**
     * GET /logs/listar
     * List all logs with filters and pagination
     */
    static async getLogs(req: Request<unknown, unknown, unknown, LogsListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { acao, from, to } = req.query;

            log.info('getLogs', 'Listando logs', {
                page,
                pageSize,
                acao,
                from,
                to
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('logs_atividades')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            // Apply filters
            if (acao) {
                query = query.eq('acao', acao);
            }

            if (from) {
                query = query.gte('created_at', from);
            }

            if (to) {
                query = query.lte('created_at', to);
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getLogs', 'Erro ao listar logs', error);
                return res.status(500).json({
                    error: 'Erro ao listar logs',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data: data || [],
                pagination: {
                    page,
                    pageSize,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / pageSize)
                }
            });
        } catch (error) {
            log.error('getLogs', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /logs/recentes
     * Get recent logs for dashboard (last 10)
     */
    static async getRecentLogs(req: Request, res: Response): Promise<Response | void> {
        try {
            const limit = Number(req.query.limit) || 10;
            const validLimit = Math.min(Math.max(1, limit), 50);

            log.info('getRecentLogs', 'Buscando logs recentes', { limit: validLimit });

            const { data, error } = await SupabaseWrapper.get()
                .from('logs_atividades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(validLimit);

            if (error) {
                log.error('getRecentLogs', 'Erro ao buscar logs recentes', error);
                return res.status(500).json({
                    error: 'Erro ao buscar logs recentes',
                    details: error.message
                });
            }

            // Format logs for display
            const formattedLogs = (data || []).map(logEntry => ({
                ...logEntry,
                acao_formatada: formatLogAction(logEntry.acao as LogAction)
            }));

            return res.status(200).json({
                success: true,
                data: formattedLogs
            });
        } catch (error) {
            log.error('getRecentLogs', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /logs/registrar
     * Create a new log entry
     */
    static async createLog(req: Request, res: Response): Promise<Response | void> {
        try {
            const {
                acao,
                descricao,
                usuario_tipo,
                usuario_email,
                entidade_tipo,
                entidade_id,
                dados_adicionais
            } = req.body as LogEntry;

            // Validate required fields
            if (!acao || !descricao) {
                return res.status(400).json({
                    error: 'Campos obrigatórios não preenchidos',
                    required: ['acao', 'descricao']
                });
            }

            log.info('createLog', 'Criando log', { acao, descricao });

            const { data, error } = await SupabaseWrapper.get()
                .from('logs_atividades')
                .insert({
                    acao,
                    descricao,
                    usuario_tipo: usuario_tipo || null,
                    usuario_email: usuario_email || null,
                    entidade_tipo: entidade_tipo || null,
                    entidade_id: entidade_id || null,
                    dados_adicionais: dados_adicionais || null
                })
                .select()
                .single();

            if (error) {
                log.error('createLog', 'Erro ao criar log', error);
                return res.status(500).json({
                    error: 'Erro ao criar log',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('createLog', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /logs/tipos
     * Get list of log action types
     */
    static async getTipos(req: Request, res: Response): Promise<Response | void> {
        const tipos = [
            { value: 'aluno_criado', label: '👶 Aluno cadastrado' },
            { value: 'aluno_atualizado', label: '✏️ Aluno atualizado' },
            { value: 'aluno_removido', label: '🗑️ Aluno removido' },
            { value: 'turma_criada', label: '📚 Turma criada' },
            { value: 'turma_atualizada', label: '✏️ Turma atualizada' },
            { value: 'presenca_registrada', label: '✅ Presença registrada' },
            { value: 'advertencia_criada', label: '⚠️ Advertência registrada' },
            { value: 'justificativa_criada', label: '📝 Justificativa enviada' },
            { value: 'justificativa_aprovada', label: '✅ Justificativa aprovada' },
            { value: 'justificativa_rejeitada', label: '❌ Justificativa rejeitada' },
            { value: 'docente_criado', label: '👨‍🏫 Docente cadastrado' },
            { value: 'docente_atualizado', label: '✏️ Docente atualizado' },
            { value: 'responsavel_criado', label: '👤 Responsável cadastrado' },
            { value: 'notificacao_enviada', label: '📧 Notificação enviada' },
            { value: 'documento_enviado', label: '📄 Documento enviado' },
            { value: 'conteudo_publicado', label: '📰 Conteúdo publicado' },
            { value: 'acompanhamento_criado', label: '📋 Acompanhamento registrado' },
            { value: 'login_realizado', label: '🔐 Login realizado' },
            { value: 'usuario_cadastrado', label: '👤 Usuário cadastrado' }
        ];

        return res.status(200).json({
            success: true,
            data: tipos
        });
    }
}

// Helper function to create log entries from other controllers
export async function registrarLog(logEntry: LogEntry): Promise<void> {
    try {
        await SupabaseWrapper.get()
            .from('logs_atividades')
            .insert({
                acao: logEntry.acao,
                descricao: logEntry.descricao,
                usuario_tipo: logEntry.usuario_tipo || null,
                usuario_email: logEntry.usuario_email || null,
                entidade_tipo: logEntry.entidade_tipo || null,
                entidade_id: logEntry.entidade_id || null,
                dados_adicionais: logEntry.dados_adicionais || null
            });
    } catch (error) {
        log.error('registrarLog', 'Erro ao registrar log automaticamente', error as Error);
    }
}

export const logsController: EndpointController = {
    name: 'logs',
    routes: {
        'listar': [
            { key: RequestType.GET, value: LogsController.getLogs }
        ],
        'recentes': [
            { key: RequestType.GET, value: LogsController.getRecentLogs }
        ],
        'registrar': [
            { key: RequestType.POST, value: LogsController.createLog }
        ],
        'tipos': [
            { key: RequestType.GET, value: LogsController.getTipos }
        ]
    }
};
