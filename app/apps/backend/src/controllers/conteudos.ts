import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger } from '../utils/validation';

const log = createControllerLogger('conteudos');

type ListQueryParams = {
    page?: string;
    pageSize?: string;
    categoria?: string;
    unidadeId?: string;
    search?: string;
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

export default class ConteudosController {
    /**
     * GET /conteudos/listar
     * List all institutional contents with pagination and filters
     */
    static async getConteudos(req: Request<unknown, unknown, unknown, ListQueryParams>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { categoria, unidadeId, search } = req.query;

            log.info('getConteudos', 'Listando conteúdos institucionais', {
                page,
                pageSize,
                categoria,
                unidadeId,
                search
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            const queryBuilder = SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .select(`
                    id_conteudos_institucionais,
                    created_at,
                    categoria,
                    conteudo,
                    anexo_url,
                    data_time_conteudo,
                    atualizado_conteudo,
                    id_docente,
                    id_unidade,
                    docentes ( id_docente, nome_docente ),
                    unidades ( id_unidade, nome_unidade )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (categoria) {
                queryBuilder.ilike('categoria', `%${categoria.trim()}%`);
            }

            if (unidadeId && isPositiveInteger(unidadeId)) {
                queryBuilder.eq('id_unidade', Number(unidadeId));
            }

            if (search) {
                queryBuilder.or(`categoria.ilike.%${search.trim()}%,conteudo.ilike.%${search.trim()}%`);
            }

            const { data, error, count } = await queryBuilder;

            if (error) {
                log.error('getConteudos', 'Erro ao buscar conteúdos', error);
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
            log.error('getConteudos', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /conteudos/detalhe/:id
     * Get a specific content by ID
     */
    static async getConteudoById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getConteudoById', `Buscando conteúdo com ID: ${id}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .select(`
                    id_conteudos_institucionais,
                    created_at,
                    categoria,
                    conteudo,
                    anexo_url,
                    data_time_conteudo,
                    atualizado_conteudo,
                    id_docente,
                    id_unidade,
                    docentes ( id_docente, nome_docente ),
                    unidades ( id_unidade, nome_unidade )
                `)
                .eq('id_conteudos_institucionais', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getConteudoById', 'Erro ao buscar conteúdo', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                log.warn('getConteudoById', `Conteúdo não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Conteúdo não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getConteudoById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /conteudos/criar
     * Create a new institutional content
     */
    static async createConteudo(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            if (!payload.categoria || !payload.conteudo) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields: [
                        !payload.categoria ? 'categoria' : null,
                        !payload.conteudo ? 'conteudo' : null
                    ].filter(Boolean)
                });
            }

            log.info('createConteudo', 'Criando conteúdo institucional', {
                categoria: payload.categoria
            });

            const insertPayload = {
                categoria: payload.categoria,
                conteudo: payload.conteudo,
                anexo_url: payload.anexo_url ?? null,
                id_docente: payload.id_docente ? Number(payload.id_docente) : null,
                id_unidade: payload.id_unidade ? Number(payload.id_unidade) : null,
                data_time_conteudo: new Date().toISOString(),
                atualizado_conteudo: new Date().toISOString()
            };

            const { data, error } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .insert([insertPayload])
                .select(`
                    id_conteudos_institucionais,
                    created_at,
                    categoria,
                    conteudo,
                    anexo_url,
                    data_time_conteudo,
                    atualizado_conteudo,
                    id_docente,
                    id_unidade,
                    docentes ( id_docente, nome_docente ),
                    unidades ( id_unidade, nome_unidade )
                `)
                .single();

            if (error) {
                log.error('createConteudo', 'Erro ao criar conteúdo', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Conteúdo criado com sucesso'
            });
        } catch (error) {
            log.error('createConteudo', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * PUT /conteudos/atualizar/:id
     * Update an institutional content
     */
    static async updateConteudo(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            log.info('updateConteudo', 'Atualizando conteúdo', { id });

            // Check if content exists
            const { data: existingContent, error: fetchError } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .select('id_conteudos_institucionais')
                .eq('id_conteudos_institucionais', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateConteudo', 'Erro ao buscar conteúdo', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingContent) {
                log.warn('updateConteudo', 'Conteúdo não encontrado', { id });
                return res.status(404).json({
                    error: 'Conteúdo não encontrado'
                });
            }

            const updates: Record<string, unknown> = {
                atualizado_conteudo: new Date().toISOString()
            };

            if (payload.categoria !== undefined) {
                updates.categoria = payload.categoria;
            }

            if (payload.conteudo !== undefined) {
                updates.conteudo = payload.conteudo;
            }

            if (payload.anexo_url !== undefined) {
                updates.anexo_url = payload.anexo_url;
            }

            if (payload.id_docente !== undefined) {
                updates.id_docente = payload.id_docente ? Number(payload.id_docente) : null;
            }

            if (payload.id_unidade !== undefined) {
                updates.id_unidade = payload.id_unidade ? Number(payload.id_unidade) : null;
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .update(updates)
                .eq('id_conteudos_institucionais', Number(id))
                .select(`
                    id_conteudos_institucionais,
                    created_at,
                    categoria,
                    conteudo,
                    anexo_url,
                    data_time_conteudo,
                    atualizado_conteudo,
                    id_docente,
                    id_unidade,
                    docentes ( id_docente, nome_docente ),
                    unidades ( id_unidade, nome_unidade )
                `)
                .single();

            if (error) {
                log.error('updateConteudo', 'Erro ao atualizar conteúdo', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Conteúdo atualizado com sucesso'
            });
        } catch (error) {
            log.error('updateConteudo', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * DELETE /conteudos/deletar/:id
     * Delete an institutional content
     */
    static async deleteConteudo(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('deleteConteudo', 'Removendo conteúdo', { id });

            // Check if content exists
            const { data: existingContent, error: fetchError } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .select('id_conteudos_institucionais')
                .eq('id_conteudos_institucionais', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteConteudo', 'Erro ao buscar conteúdo', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingContent) {
                log.warn('deleteConteudo', 'Conteúdo não encontrado', { id });
                return res.status(404).json({
                    error: 'Conteúdo não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .delete()
                .eq('id_conteudos_institucionais', Number(id));

            if (error) {
                log.error('deleteConteudo', 'Erro ao remover conteúdo', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Conteúdo removido com sucesso'
            });
        } catch (error) {
            log.error('deleteConteudo', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /conteudos/categorias
     * Get list of distinct categories
     */
    static async getCategorias(req: Request, res: Response): Promise<Response | void> {
        try {
            log.info('getCategorias', 'Listando categorias de conteúdos');

            const { data, error } = await SupabaseWrapper.get()
                .from('conteudos_institucionais')
                .select('categoria')
                .order('categoria');

            if (error) {
                log.error('getCategorias', 'Erro ao buscar categorias', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Get unique categories
            const categorias = [...new Set((data || []).map(d => d.categoria).filter(Boolean))];

            return res.status(200).json({
                success: true,
                data: categorias
            });
        } catch (error) {
            log.error('getCategorias', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const conteudosController: EndpointController = {
    name: 'conteudos',
    routes: {
        'listar': [
            { key: RequestType.GET, value: ConteudosController.getConteudos }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: ConteudosController.getConteudoById }
        ],
        'categorias': [
            { key: RequestType.GET, value: ConteudosController.getCategorias }
        ],
        'criar': [
            { key: RequestType.POST, value: ConteudosController.createConteudo }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: ConteudosController.updateConteudo }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: ConteudosController.deleteConteudo }
        ]
    }
};

export { conteudosController };
