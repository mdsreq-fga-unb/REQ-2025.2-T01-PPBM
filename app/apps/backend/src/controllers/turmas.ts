import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import logger from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, isWithinCapacity, validateRequiredFields } from '../utils/validation';

type TurmasListQuery = {
    page?: string;
    pageSize?: string;
    unidade?: string;
    cidade?: string;
    nome?: string;
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

async function countAlunosInTurma(turmaId: number): Promise<number | null> {
    const { count, error } = await SupabaseWrapper.get()
        .from('alunos_por_turma')
        .select('id_aluno', { count: 'exact', head: true })
        .eq('id_turma', turmaId);

    if (error) {
        logger.error('[turmas][countAlunos] Erro ao contar alunos na turma', { turmaId, error });
        return null;
    }

    return count ?? 0;
}

export default class TurmaController {
    static async getTurmas(req: Request<unknown, unknown, unknown, TurmasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { unidade, cidade, nome } = req.query;

            logger.info('[turmas][getTurmas] Listando turmas', {
                page,
                pageSize,
                unidade,
                cidade,
                nome
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('turmas')
                .select(`
                    id_turma,
                    created_at,
                    nome_turma,
                    limite_alunos_turma,
                    unidade_turma,
                    cidade_turma
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (unidade) {
                query = query.ilike('unidade_turma', `%${unidade.trim()}%`);
            }

            if (cidade) {
                query = query.ilike('cidade_turma', `%${cidade.trim()}%`);
            }

            if (nome) {
                query = query.ilike('nome_turma', `%${nome.trim()}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                logger.error('[turmas][getTurmas] Erro ao buscar turmas', error);
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
            logger.error('[turmas][getTurmas] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getTurmaById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            logger.info('[turmas][getTurmaById] Buscando turma', { id });

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .select(`
                    id_turma,
                    created_at,
                    nome_turma,
                    limite_alunos_turma,
                    unidade_turma,
                    cidade_turma
                `)
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (error) {
                logger.error('[turmas][getTurmaById] Erro ao buscar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            logger.error('[turmas][getTurmaById] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['nome_turma', 'limite_alunos_turma', 'unidade_turma']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.limite_alunos_turma)) {
                return res.status(400).json({
                    error: 'Limite de alunos deve ser um número inteiro positivo'
                });
            }

            const insertPayload = {
                nome_turma: payload.nome_turma,
                limite_alunos_turma: Number(payload.limite_alunos_turma),
                unidade_turma: payload.unidade_turma,
                cidade_turma: payload.cidade_turma ?? null
            };

            logger.info('[turmas][createTurma] Criando turma', { nome: insertPayload.nome_turma });

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                logger.error('[turmas][createTurma] Erro ao criar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Turma criada com sucesso'
            });
        } catch (error) {
            logger.error('[turmas][createTurma] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            const { data: existingTurma, error: fetchError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma, limite_alunos_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[turmas][updateTurma] Erro ao buscar turma', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingTurma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.nome_turma !== undefined) {
                updates.nome_turma = payload.nome_turma;
            }

            if (payload.unidade_turma !== undefined) {
                updates.unidade_turma = payload.unidade_turma;
            }

            if (payload.cidade_turma !== undefined) {
                updates.cidade_turma = payload.cidade_turma;
            }

            if (payload.limite_alunos_turma !== undefined) {
                if (!isPositiveInteger(payload.limite_alunos_turma)) {
                    return res.status(400).json({
                        error: 'Limite de alunos deve ser um número inteiro positivo'
                    });
                }

                const newCapacity = Number(payload.limite_alunos_turma);
                const currentCount = await countAlunosInTurma(Number(id));

                if (currentCount === null) {
                    return res.status(500).json({
                        error: 'Não foi possível validar a capacidade atual da turma'
                    });
                }

                if (!isWithinCapacity(currentCount, newCapacity)) {
                    return res.status(409).json({
                        error: 'Limite de alunos inferior à quantidade atual de alunos matriculados',
                        currentCount,
                        limiteAtual: existingTurma.limite_alunos_turma,
                        novoLimite: newCapacity
                    });
                }

                updates.limite_alunos_turma = newCapacity;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .update(updates)
                .eq('id_turma', Number(id))
                .select()
                .single();

            if (error) {
                logger.error('[turmas][updateTurma] Erro ao atualizar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Turma atualizada com sucesso'
            });
        } catch (error) {
            logger.error('[turmas][updateTurma] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data: existingTurma, error: fetchError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[turmas][deleteTurma] Erro ao buscar turma', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingTurma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            const currentCount = await countAlunosInTurma(Number(id));

            if (currentCount === null) {
                return res.status(500).json({
                    error: 'Não foi possível verificar matrículas associadas'
                });
            }

            if (currentCount > 0) {
                return res.status(409).json({
                    error: 'Não é possível remover uma turma com alunos matriculados',
                    currentCount
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('turmas')
                .delete()
                .eq('id_turma', Number(id));

            if (error) {
                logger.error('[turmas][deleteTurma] Erro ao remover turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Turma removida com sucesso'
            });
        } catch (error) {
            logger.error('[turmas][deleteTurma] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const turmaController: EndpointController = {
    name: 'turmas',
    routes: {
        'listar': [
            { key: RequestType.GET, value: TurmaController.getTurmas }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: TurmaController.getTurmaById }
        ],
        'criar': [
            { key: RequestType.POST, value: TurmaController.createTurma }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: TurmaController.updateTurma }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: TurmaController.deleteTurma }
        ]
    }
};

export { turmaController };


