import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, validateRequiredFields } from '../utils/validation';
import { registrarLog } from './logs';

const log = createControllerLogger('presencas');

type PresencasListQuery = {
    page?: string;
    pageSize?: string;
    alunoId?: string;
    turmaId?: string;
    docenteId?: string;
    justificativaId?: string;
    status?: string;
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

function isValidDateString(value: unknown): value is string {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }

    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
}

export default class PresencaController {
    static async getPresencas(req: Request<unknown, unknown, unknown, PresencasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const {
                alunoId,
                turmaId,
                docenteId,
                justificativaId,
                status,
                from,
                to
            } = req.query;

            log.info('getPresencas', 'Listando presenças', {
                page,
                pageSize,
                alunoId,
                turmaId,
                docenteId,
                justificativaId,
                status,
                from,
                to
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('presencas')
                .select(`
                    id_presenca,
                    created_at,
                    id_aluno,
                    id_turma,
                    data_time_presenca,
                    status_presenca,
                    id_docente,
                    id_justificativa,
                    alunos ( id_aluno, nome_aluno ),
                    turmas ( id_turma, nome_turma ),
                    docentes ( id_docente, nome_docente ),
                    justificativa ( id_justificativa, motivo_justificativa )
                `, { count: 'exact' })
                .order('data_time_presenca', { ascending: false })
                .range(start, end);

            if (alunoId && isPositiveInteger(alunoId)) {
                query = query.eq('id_aluno', Number(alunoId));
            }

            if (turmaId && isPositiveInteger(turmaId)) {
                query = query.eq('id_turma', Number(turmaId));
            }

            if (docenteId && isPositiveInteger(docenteId)) {
                query = query.eq('id_docente', Number(docenteId));
            }

            if (justificativaId && isPositiveInteger(justificativaId)) {
                query = query.eq('id_justificativa', Number(justificativaId));
            }

            if (status) {
                query = query.ilike('status_presenca', `%${status.trim()}%`);
            }

            if (from && isValidDateString(from)) {
                query = query.gte('data_time_presenca', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('data_time_presenca', new Date(to).toISOString());
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getPresencas', 'Erro ao buscar presenças', error);
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
            log.error('getPresencas', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getPresencaById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('presencas')
                .select(`
                    id_presenca,
                    created_at,
                    id_aluno,
                    id_turma,
                    data_time_presenca,
                    status_presenca,
                    id_docente,
                    id_justificativa,
                    alunos ( id_aluno, nome_aluno ),
                    turmas ( id_turma, nome_turma ),
                    docentes ( id_docente, nome_docente ),
                    justificativa ( id_justificativa, motivo_justificativa )
                `)
                .eq('id_presenca', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getPresencaById', 'Erro ao buscar presença', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Registro de presença não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getPresencaById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createPresenca(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['id_aluno', 'id_turma', 'status_presenca']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.id_aluno) || !isPositiveInteger(payload.id_turma)) {
                return res.status(400).json({
                    error: 'IDs de aluno e turma devem ser inteiros positivos'
                });
            }

            if (payload.id_docente !== undefined && !isPositiveInteger(payload.id_docente)) {
                return res.status(400).json({
                    error: 'ID de docente inválido'
                });
            }

            if (payload.id_justificativa !== undefined && !isPositiveInteger(payload.id_justificativa)) {
                return res.status(400).json({
                    error: 'ID de justificativa inválido'
                });
            }

            const requiredEntities: Array<{ table: string; column: string; id: number; label: string }> = [
                { table: 'alunos', column: 'id_aluno', id: Number(payload.id_aluno), label: 'Aluno' },
                { table: 'turmas', column: 'id_turma', id: Number(payload.id_turma), label: 'Turma' }
            ];

            if (payload.id_docente !== undefined) {
                requiredEntities.push({ table: 'docentes', column: 'id_docente', id: Number(payload.id_docente), label: 'Docente' });
            }

            if (payload.id_justificativa !== undefined) {
                requiredEntities.push({ table: 'justificativa', column: 'id_justificativa', id: Number(payload.id_justificativa), label: 'Justificativa' });
            }

            for (const entity of requiredEntities) {
                const exists = await ensureEntityExists(entity.table, entity.column, entity.id);
                if (!exists) {
                    return res.status(404).json({
                        error: `${entity.label} não encontrado`
                    });
                }
            }

            const insertPayload = {
                id_aluno: Number(payload.id_aluno),
                id_turma: Number(payload.id_turma),
                data_time_presenca: isValidDateString(payload.data_time_presenca)
                    ? new Date(payload.data_time_presenca).toISOString()
                    : new Date().toISOString(),
                status_presenca: payload.status_presenca,
                id_docente: payload.id_docente ? Number(payload.id_docente) : null,
                id_justificativa: payload.id_justificativa ? Number(payload.id_justificativa) : null
            };

            const { data, error } = await SupabaseWrapper.get()
                .from('presencas')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                log.error('createPresenca', 'Erro ao criar presença', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            const statusLabel = data.status_presenca === 'presente' ? 'Presente' : 
                               data.status_presenca === 'falta' ? 'Falta' : 
                               data.status_presenca === 'atraso' ? 'Atraso' : data.status_presenca;
            await registrarLog({
                acao: 'presenca_registrada',
                descricao: `Presença registrada: ${statusLabel} para aluno #${data.id_aluno}`,
                entidade_tipo: 'presenca',
                entidade_id: data.id_presenca,
                dados_adicionais: { 
                    id_aluno: data.id_aluno,
                    status: data.status_presenca
                }
            });

            return res.status(201).json({
                success: true,
                data,
                message: 'Presença registrada com sucesso'
            });
        } catch (error) {
            log.error('createPresenca', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updatePresenca(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            const { data: existingPresenca, error: fetchError } = await SupabaseWrapper.get()
                .from('presencas')
                .select('id_presenca')
                .eq('id_presenca', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updatePresenca', 'Erro ao buscar presença', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingPresenca) {
                return res.status(404).json({
                    error: 'Registro de presença não encontrado'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.id_aluno !== undefined) {
                if (!isPositiveInteger(payload.id_aluno)) {
                    return res.status(400).json({
                        error: 'ID de aluno inválido'
                    });
                }

                const exists = await ensureEntityExists('alunos', 'id_aluno', Number(payload.id_aluno));

                if (!exists) {
                    return res.status(404).json({
                        error: 'Aluno não encontrado'
                    });
                }

                updates.id_aluno = Number(payload.id_aluno);
            }

            if (payload.id_turma !== undefined) {
                if (!isPositiveInteger(payload.id_turma)) {
                    return res.status(400).json({
                        error: 'ID de turma inválido'
                    });
                }

                const exists = await ensureEntityExists('turmas', 'id_turma', Number(payload.id_turma));

                if (!exists) {
                    return res.status(404).json({
                        error: 'Turma não encontrada'
                    });
                }

                updates.id_turma = Number(payload.id_turma);
            }

            if (payload.id_docente !== undefined) {
                if (!isPositiveInteger(payload.id_docente)) {
                    return res.status(400).json({
                        error: 'ID de docente inválido'
                    });
                }

                const exists = await ensureEntityExists('docentes', 'id_docente', Number(payload.id_docente));

                if (!exists) {
                    return res.status(404).json({
                        error: 'Docente não encontrado'
                    });
                }

                updates.id_docente = Number(payload.id_docente);
            }

            if (payload.id_justificativa !== undefined) {
                if (!isPositiveInteger(payload.id_justificativa)) {
                    return res.status(400).json({
                        error: 'ID de justificativa inválido'
                    });
                }

                const exists = await ensureEntityExists('justificativa', 'id_justificativa', Number(payload.id_justificativa));

                if (!exists) {
                    return res.status(404).json({
                        error: 'Justificativa não encontrada'
                    });
                }

                updates.id_justificativa = Number(payload.id_justificativa);
            }

            if (payload.status_presenca !== undefined) {
                if (typeof payload.status_presenca !== 'string' || !payload.status_presenca.trim()) {
                    return res.status(400).json({
                        error: 'Status da presença inválido'
                    });
                }

                updates.status_presenca = payload.status_presenca.trim();
            }

            if (payload.data_time_presenca !== undefined) {
                if (!isValidDateString(payload.data_time_presenca)) {
                    return res.status(400).json({
                        error: 'Data/hora da presença inválida'
                    });
                }

                updates.data_time_presenca = new Date(payload.data_time_presenca).toISOString();
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('presencas')
                .update(updates)
                .eq('id_presenca', Number(id))
                .select()
                .single();

            if (error) {
                log.error('updatePresenca', 'Erro ao atualizar presença', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Presença atualizada com sucesso'
            });
        } catch (error) {
            log.error('updatePresenca', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deletePresenca(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data: existingPresenca, error: fetchError } = await SupabaseWrapper.get()
                .from('presencas')
                .select('id_presenca')
                .eq('id_presenca', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deletePresenca', 'Erro ao buscar presença', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingPresenca) {
                return res.status(404).json({
                    error: 'Registro de presença não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('presencas')
                .delete()
                .eq('id_presenca', Number(id));

            if (error) {
                log.error('deletePresenca', 'Erro ao remover presença', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Registro de presença removido com sucesso'
            });
        } catch (error) {
            log.error('deletePresenca', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /presencas/estatisticas
     * Get aggregated attendance statistics for reports
     */
    static async getEstatisticas(req: Request<unknown, unknown, unknown, PresencasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { turmaId, from, to } = req.query;

            log.info('getEstatisticas', 'Buscando estatísticas de presenças', { turmaId, from, to });

            // Build query for all attendance records in the period
            let query = SupabaseWrapper.get()
                .from('presencas')
                .select(`
                    id_presenca,
                    data_time_presenca,
                    status_presenca,
                    id_turma,
                    id_aluno,
                    turmas ( id_turma, nome_turma ),
                    alunos ( id_aluno, nome_aluno )
                `);

            if (turmaId && isPositiveInteger(turmaId)) {
                query = query.eq('id_turma', Number(turmaId));
            }

            if (from && isValidDateString(from)) {
                query = query.gte('data_time_presenca', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('data_time_presenca', new Date(to).toISOString());
            }

            const { data: presencas, error } = await query;

            if (error) {
                log.error('getEstatisticas', 'Erro ao buscar presenças', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            const records = presencas || [];

            // Calculate statistics by status
            const porStatus = {
                presente: 0,
                atraso: 0,
                falta: 0
            };

            // Calculate statistics by turma
            const porTurma: Record<string, { nome: string; presente: number; atraso: number; falta: number; total: number }> = {};

            // Calculate statistics by date (for trend chart)
            const porData: Record<string, { presente: number; atraso: number; falta: number }> = {};

            // Calculate statistics by aluno
            const porAluno: Record<string, { nome: string; presente: number; atraso: number; falta: number; total: number }> = {};

            records.forEach((record: any) => {
                const status = record.status_presenca?.toLowerCase() || 'falta';
                const turmaId = record.id_turma?.toString() || 'sem_turma';
                const turmaNome = record.turmas?.nome_turma || 'Sem turma';
                const alunoId = record.id_aluno?.toString() || 'sem_aluno';
                const alunoNome = record.alunos?.nome_aluno || 'Desconhecido';
                const dataPresenca = record.data_time_presenca
                    ? (new Date(record.data_time_presenca).toISOString().split('T')[0] ?? 'sem_data')
                    : 'sem_data';

                // Count by status
                if (status === 'presente') {
                    porStatus.presente++;
                } else if (status === 'atraso') {
                    porStatus.atraso++;
                } else {
                    porStatus.falta++;
                }

                // Count by turma
                if (!porTurma[turmaId]) {
                    porTurma[turmaId] = { nome: turmaNome, presente: 0, atraso: 0, falta: 0, total: 0 };
                }
                porTurma[turmaId].total++;
                if (status === 'presente') {
                    porTurma[turmaId].presente++;
                } else if (status === 'atraso') {
                    porTurma[turmaId].atraso++;
                } else {
                    porTurma[turmaId].falta++;
                }

                // Count by date
                if (!porData[dataPresenca]) {
                    porData[dataPresenca] = { presente: 0, atraso: 0, falta: 0 };
                }
                if (status === 'presente') {
                    porData[dataPresenca].presente++;
                } else if (status === 'atraso') {
                    porData[dataPresenca].atraso++;
                } else {
                    porData[dataPresenca].falta++;
                }

                // Count by aluno
                if (!porAluno[alunoId]) {
                    porAluno[alunoId] = { nome: alunoNome, presente: 0, atraso: 0, falta: 0, total: 0 };
                }
                porAluno[alunoId].total++;
                if (status === 'presente') {
                    porAluno[alunoId].presente++;
                } else if (status === 'atraso') {
                    porAluno[alunoId].atraso++;
                } else {
                    porAluno[alunoId].falta++;
                }
            });

            // Convert porTurma to array and calculate rates
            const turmasArray = Object.entries(porTurma).map(([id, stats]) => ({
                id,
                nome: stats.nome,
                presente: stats.presente,
                atraso: stats.atraso,
                falta: stats.falta,
                total: stats.total,
                taxaPresenca: stats.total > 0 ? Math.round(((stats.presente + stats.atraso) / stats.total) * 100) : 0
            })).sort((a, b) => b.total - a.total);

            // Convert porData to sorted array for trend chart
            const tendencia = Object.entries(porData)
                .map(([data, stats]) => ({
                    data,
                    ...stats,
                    total: stats.presente + stats.atraso + stats.falta
                }))
                .sort((a, b) => a.data.localeCompare(b.data));

            // Convert porAluno to array and get top 10 by attendance rate
            const alunosArray = Object.entries(porAluno).map(([id, stats]) => ({
                id,
                nome: stats.nome,
                presente: stats.presente,
                atraso: stats.atraso,
                falta: stats.falta,
                total: stats.total,
                taxaPresenca: stats.total > 0 ? Math.round(((stats.presente + stats.atraso) / stats.total) * 100) : 0
            })).sort((a, b) => b.taxaPresenca - a.taxaPresenca);

            const totalRegistros = records.length;
            const taxaGeralPresenca = totalRegistros > 0
                ? Math.round(((porStatus.presente + porStatus.atraso) / totalRegistros) * 100)
                : 0;

            return res.status(200).json({
                success: true,
                data: {
                    resumo: {
                        totalRegistros,
                        presente: porStatus.presente,
                        atraso: porStatus.atraso,
                        falta: porStatus.falta,
                        taxaPresenca: taxaGeralPresenca
                    },
                    porTurma: turmasArray,
                    tendencia,
                    topAlunos: alunosArray.slice(0, 10),
                    todosAlunos: alunosArray
                }
            });
        } catch (error) {
            log.error('getEstatisticas', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const presencaController: EndpointController = {
    name: 'presencas',
    routes: {
        'listar': [
            { key: RequestType.GET, value: PresencaController.getPresencas }
        ],
        'estatisticas': [
            { key: RequestType.GET, value: PresencaController.getEstatisticas }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: PresencaController.getPresencaById }
        ],
        'criar': [
            { key: RequestType.POST, value: PresencaController.createPresenca }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: PresencaController.updatePresenca }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: PresencaController.deletePresenca }
        ]
    }
};

export { presencaController };


