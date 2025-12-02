import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, validateRequiredFields } from '../utils/validation';
import { registrarLog } from './logs';

const log = createControllerLogger('advertencias');

type AdvertenciasListQuery = {
    page?: string;
    pageSize?: string;
    alunoId?: string;
    docenteId?: string;
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

export default class AdvertenciaController {
    /**
     * GET /advertencias/listar
     * List all advertências with filters and pagination
     */
    static async getAdvertencias(req: Request<unknown, unknown, unknown, AdvertenciasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { alunoId, docenteId, from, to } = req.query;

            log.info('getAdvertencias', 'Listando advertências', {
                page,
                pageSize,
                alunoId,
                docenteId,
                from,
                to
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('advertencias')
                .select(`
                    id_advertencia,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_advertencia,
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (alunoId && isPositiveInteger(alunoId)) {
                query = query.eq('id_aluno', Number(alunoId));
            }

            if (docenteId && isPositiveInteger(docenteId)) {
                query = query.eq('id_docente', Number(docenteId));
            }

            if (from && isValidDateString(from)) {
                query = query.gte('created_at', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('created_at', new Date(to).toISOString());
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getAdvertencias', 'Erro ao buscar advertências', error);
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
            log.error('getAdvertencias', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /advertencias/detalhe/:id
     * Get a single advertência by ID
     */
    static async getAdvertenciaById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getAdvertenciaById', `Buscando advertência com ID: ${id}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('advertencias')
                .select(`
                    id_advertencia,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_advertencia,
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `)
                .eq('id_advertencia', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getAdvertenciaById', 'Erro ao buscar advertência', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Advertência não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getAdvertenciaById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /advertencias/por-aluno/:id
     * Get all advertências for a specific student
     */
    static async getAdvertenciasByAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID de aluno inválido'
                });
            }

            log.info('getAdvertenciasByAluno', `Buscando advertências do aluno: ${id}`);

            // Check if student exists
            const alunoExists = await ensureEntityExists('alunos', 'id_aluno', Number(id));
            if (!alunoExists) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('advertencias')
                .select(`
                    id_advertencia,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_advertencia,
                    docentes ( id_docente, nome_docente )
                `)
                .eq('id_aluno', Number(id))
                .order('created_at', { ascending: false });

            if (error) {
                log.error('getAdvertenciasByAluno', 'Erro ao buscar advertências', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data: data || [],
                total: data?.length ?? 0
            });
        } catch (error) {
            log.error('getAdvertenciasByAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /advertencias/criar
     * Create a new advertência (immutable - no update allowed per requirements)
     */
    static async createAdvertencia(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['id_aluno', 'descricao_advertencia']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.id_aluno)) {
                return res.status(400).json({
                    error: 'ID de aluno deve ser um inteiro positivo'
                });
            }

            if (payload.id_docente !== undefined && !isPositiveInteger(payload.id_docente)) {
                return res.status(400).json({
                    error: 'ID de docente inválido'
                });
            }

            // Validate description is not empty
            if (typeof payload.descricao_advertencia !== 'string' || !payload.descricao_advertencia.trim()) {
                return res.status(400).json({
                    error: 'Descrição da advertência é obrigatória'
                });
            }

            log.info('createAdvertencia', 'Verificando existência do aluno', { alunoId: payload.id_aluno });

            // Check if student exists
            const alunoExists = await ensureEntityExists('alunos', 'id_aluno', Number(payload.id_aluno));
            if (!alunoExists) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Check if docente exists (if provided)
            if (payload.id_docente) {
                const docenteExists = await ensureEntityExists('docentes', 'id_docente', Number(payload.id_docente));
                if (!docenteExists) {
                    return res.status(404).json({
                        error: 'Docente não encontrado'
                    });
                }
            }

            const insertPayload = {
                id_aluno: Number(payload.id_aluno),
                id_docente: payload.id_docente ? Number(payload.id_docente) : null,
                descricao_advertencia: payload.descricao_advertencia.trim()
            };

            log.info('createAdvertencia', 'Criando advertência', { alunoId: insertPayload.id_aluno });

            const { data, error } = await SupabaseWrapper.get()
                .from('advertencias')
                .insert([insertPayload])
                .select(`
                    id_advertencia,
                    created_at,
                    id_aluno,
                    id_docente,
                    descricao_advertencia,
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `)
                .single();

            if (error) {
                log.error('createAdvertencia', 'Erro ao criar advertência', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            // Handle both array and object responses from Supabase
            const alunosData = data.alunos as any;
            const nomeAluno = Array.isArray(alunosData) 
                ? alunosData[0]?.nome_aluno 
                : alunosData?.nome_aluno || 'Aluno';
            await registrarLog({
                acao: 'advertencia_criada',
                descricao: `Advertência registrada para ${nomeAluno}`,
                entidade_tipo: 'advertencia',
                entidade_id: data.id_advertencia,
                dados_adicionais: { 
                    id_aluno: data.id_aluno,
                    nome_aluno: nomeAluno
                }
            });

            return res.status(201).json({
                success: true,
                data,
                message: 'Advertência registrada com sucesso'
            });
        } catch (error) {
            log.error('createAdvertencia', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Note: No update or delete endpoints are provided as per US-011 requirements
     * "Deve manter histórico imutável"
     */
}

const advertenciaController: EndpointController = {
    name: 'advertencias',
    routes: {
        'listar': [
            { key: RequestType.GET, value: AdvertenciaController.getAdvertencias }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: AdvertenciaController.getAdvertenciaById }
        ],
        'por-aluno/:id': [
            { key: RequestType.GET, value: AdvertenciaController.getAdvertenciasByAluno }
        ],
        'criar': [
            { key: RequestType.POST, value: AdvertenciaController.createAdvertencia }
        ]
        // No update or delete routes - advertências are immutable per requirements
    }
};

export { advertenciaController };
