import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger } from '../utils/validation';
import { UploadedFile } from 'express-fileupload';

const log = createControllerLogger('documentos');

// Define types for documents
type DocumentoTipo = 'laudo_medico' | 'identificacao' | 'outro';

interface DocumentoAluno {
    id_documento: number;
    id_aluno: number;
    tipo_documento: DocumentoTipo;
    nome_arquivo: string;
    url_arquivo: string;
    descricao?: string;
    created_at: string;
}

// Storage bucket name
const STORAGE_BUCKET = 'documentos-alunos';

export default class DocumentosController {
    /**
     * POST /documentos/upload/:alunoId
     * Upload a document for a student
     */
    static async uploadDocumento(req: Request, res: Response): Promise<Response | void> {
        try {
            const { alunoId } = req.params;
            const { tipo, descricao } = req.body;

            if (!isPositiveInteger(alunoId)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            if (!req.files || !req.files.arquivo) {
                return res.status(400).json({
                    error: 'Nenhum arquivo enviado'
                });
            }

            const arquivo = req.files.arquivo as UploadedFile;

            // Validate file type (allow PDF and images)
            const allowedMimeTypes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp'
            ];

            if (!allowedMimeTypes.includes(arquivo.mimetype)) {
                return res.status(400).json({
                    error: 'Tipo de arquivo não permitido. Use PDF, JPEG, PNG ou WebP.'
                });
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (arquivo.size > maxSize) {
                return res.status(400).json({
                    error: 'Arquivo muito grande. Tamanho máximo: 10MB'
                });
            }

            // Verify student exists
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select('id_aluno, nome_aluno')
                .eq('id_aluno', Number(alunoId))
                .maybeSingle();

            if (alunoError || !aluno) {
                log.error('uploadDocumento', 'Aluno não encontrado', alunoError);
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            log.info('uploadDocumento', 'Fazendo upload de documento', {
                alunoId,
                tipo,
                fileName: arquivo.name,
                size: arquivo.size
            });

            // Generate unique file path
            const timestamp = Date.now();
            const sanitizedName = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `aluno_${alunoId}/${tipo || 'documento'}_${timestamp}_${sanitizedName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await SupabaseWrapper.get()
                .storage
                .from(STORAGE_BUCKET)
                .upload(filePath, arquivo.data, {
                    contentType: arquivo.mimetype,
                    upsert: false
                });

            if (uploadError) {
                log.error('uploadDocumento', 'Erro ao fazer upload para storage', uploadError);
                return res.status(500).json({
                    error: 'Erro ao fazer upload do arquivo',
                    details: uploadError.message
                });
            }

            // Get public URL
            const { data: urlData } = SupabaseWrapper.get()
                .storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            const publicUrl = urlData?.publicUrl || '';

            // Store document metadata in database
            // Note: Using relatorios_acompanhamentos table with tipo_relatorio = 'documento'
            // or we could create a dedicated documentos table
            const { data: docData, error: docError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .insert([{
                    id_aluno: Number(alunoId),
                    descricao_relatorio_acompanhamento: descricao || `Documento: ${arquivo.name}`,
                    data_relatorio_acompanhamento: new Date().toISOString(),
                    anexo_url: publicUrl,
                    tipo_relatorio: tipo || 'documento'
                }])
                .select()
                .single();

            if (docError) {
                log.error('uploadDocumento', 'Erro ao salvar metadados', docError);
                // Try to delete uploaded file on error
                await SupabaseWrapper.get()
                    .storage
                    .from(STORAGE_BUCKET)
                    .remove([filePath]);

                return res.status(500).json({
                    error: 'Erro ao salvar informações do documento',
                    details: docError.message
                });
            }

            return res.status(201).json({
                success: true,
                data: {
                    id: docData.id_relatorios_acompanhamento,
                    url: publicUrl,
                    nome: arquivo.name,
                    tipo: tipo || 'documento',
                    descricao: descricao
                },
                message: 'Documento enviado com sucesso'
            });
        } catch (error) {
            log.error('uploadDocumento', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /documentos/aluno/:alunoId
     * List all documents for a student
     */
    static async getDocumentosAluno(req: Request, res: Response): Promise<Response | void> {
        try {
            const { alunoId } = req.params;
            const { tipo } = req.query as { tipo?: string };

            if (!isPositiveInteger(alunoId)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            log.info('getDocumentosAluno', 'Listando documentos do aluno', { alunoId, tipo });

            let queryBuilder = SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select(`
                    id_relatorios_acompanhamento,
                    created_at,
                    descricao_relatorio_acompanhamento,
                    data_relatorio_acompanhamento,
                    anexo_url,
                    tipo_relatorio,
                    id_docente,
                    docentes ( nome_docente )
                `)
                .eq('id_aluno', Number(alunoId))
                .not('anexo_url', 'is', null)
                .order('created_at', { ascending: false });

            // Filter by document type if provided
            if (tipo) {
                queryBuilder = queryBuilder.eq('tipo_relatorio', tipo);
            }

            const { data, error } = await queryBuilder;

            if (error) {
                log.error('getDocumentosAluno', 'Erro ao buscar documentos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Transform response
            const documentos = (data || []).map(doc => ({
                id: doc.id_relatorios_acompanhamento,
                tipo: doc.tipo_relatorio,
                descricao: doc.descricao_relatorio_acompanhamento,
                url: doc.anexo_url,
                data: doc.data_relatorio_acompanhamento || doc.created_at,
                docente: (doc as any).docentes?.nome_docente || null
            }));

            return res.status(200).json({
                success: true,
                data: documentos,
                total: documentos.length
            });
        } catch (error) {
            log.error('getDocumentosAluno', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * DELETE /documentos/deletar/:id
     * Delete a document
     */
    static async deleteDocumento(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('deleteDocumento', 'Removendo documento', { id });

            // Get document info first
            const { data: doc, error: fetchError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select('id_relatorios_acompanhamento, anexo_url')
                .eq('id_relatorios_acompanhamento', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteDocumento', 'Erro ao buscar documento', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!doc) {
                return res.status(404).json({
                    error: 'Documento não encontrado'
                });
            }

            // Try to delete from storage if URL exists
            if (doc.anexo_url) {
                try {
                    // Extract file path from URL
                    const url = new URL(doc.anexo_url);
                    const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`);
                    if (pathParts.length > 1 && pathParts[1]) {
                        const filePath = decodeURIComponent(pathParts[1]);
                        await SupabaseWrapper.get()
                            .storage
                            .from(STORAGE_BUCKET)
                            .remove([filePath]);
                    }
                } catch (storageError) {
                    log.warn('deleteDocumento', 'Erro ao remover arquivo do storage', storageError);
                    // Continue with database deletion even if storage fails
                }
            }

            // Delete from database
            const { error: deleteError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .delete()
                .eq('id_relatorios_acompanhamento', Number(id));

            if (deleteError) {
                log.error('deleteDocumento', 'Erro ao remover documento', deleteError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: deleteError.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Documento removido com sucesso'
            });
        } catch (error) {
            log.error('deleteDocumento', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /documentos/download/:id
     * Get signed URL for document download
     */
    static async getDownloadUrl(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getDownloadUrl', 'Gerando URL de download', { id });

            // Get document info
            const { data: doc, error: fetchError } = await SupabaseWrapper.get()
                .from('relatorios_acompanhamentos')
                .select('id_relatorios_acompanhamento, anexo_url, descricao_relatorio_acompanhamento')
                .eq('id_relatorios_acompanhamento', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('getDownloadUrl', 'Erro ao buscar documento', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!doc || !doc.anexo_url) {
                return res.status(404).json({
                    error: 'Documento não encontrado'
                });
            }

            // For public URLs, just return the URL
            // For private buckets, we would create a signed URL here
            return res.status(200).json({
                success: true,
                data: {
                    url: doc.anexo_url,
                    nome: doc.descricao_relatorio_acompanhamento
                }
            });
        } catch (error) {
            log.error('getDownloadUrl', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /documentos/tipos
     * Get list of document types
     */
    static async getTipos(req: Request, res: Response): Promise<Response | void> {
        return res.status(200).json({
            success: true,
            data: [
                { value: 'laudo_medico', label: 'Laudo Médico' },
                { value: 'identificacao', label: 'Documento de Identificação' },
                { value: 'comprovante', label: 'Comprovante' },
                { value: 'atestado', label: 'Atestado' },
                { value: 'outro', label: 'Outro' }
            ]
        });
    }
}

const documentosController: EndpointController = {
    name: 'documentos',
    routes: {
        'upload/:alunoId': [
            { key: RequestType.POST, value: DocumentosController.uploadDocumento }
        ],
        'aluno/:alunoId': [
            { key: RequestType.GET, value: DocumentosController.getDocumentosAluno }
        ],
        'download/:id': [
            { key: RequestType.GET, value: DocumentosController.getDownloadUrl }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: DocumentosController.deleteDocumento }
        ],
        'tipos': [
            { key: RequestType.GET, value: DocumentosController.getTipos }
        ]
    }
};

export { documentosController };
