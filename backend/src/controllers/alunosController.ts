import { Request, Response } from 'express';
import { EndpointController, RequestType } from '../interfaces/index';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { Pair } from '../utils/utils';
import { 
    Aluno, 
    Responsavel, 
    CadastroAlunoRequest, 
    CadastroAlunoResponse 
} from '../interfaces/aluno';
import { 
    isValidCPF, 
    normalizeCPF, 
    isValidDate, 
    isValidEmail, 
    isValidPhone 
} from '../utils/validation';
import logger from '../logger';

export class AlunosController implements EndpointController {
    name = 'alunos';
    
    routes = {
        '': [new Pair(RequestType.POST, this.cadastrarAluno.bind(this))]
    };

    /**
     * Cadastra um novo aluno com seu responsável
     * POST /alunos
     */
    async cadastrarAluno(req: Request, res: Response): Promise<Response> {
        try {
            logger.info('[AlunosController][cadastrarAluno] Iniciando cadastro de aluno');
            
            const requestData: CadastroAlunoRequest = req.body;
            
            // Validar dados de entrada
            const validationResult = this.validateCadastroRequest(requestData);
            if (!validationResult.isValid) {
                logger.warn('[AlunosController][cadastrarAluno] Dados inválidos:', validationResult.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    error: validationResult.errors.join(', ')
                } as CadastroAlunoResponse);
            }

            const supabase = SupabaseWrapper.get();
            
            // Normalizar CPFs
            const cpfAlunoNormalizado = normalizeCPF(requestData.aluno.cpf_aluno);
            const cpfResponsavelNormalizado = requestData.responsavel.cpf_responsavel 
                ? normalizeCPF(requestData.responsavel.cpf_responsavel) 
                : null;

            // Verificar se já existe aluno com o mesmo CPF
            const { data: alunoExistente, error: errorBuscaAluno } = await supabase
                .from('alunos')
                .select('id_aluno, nome_aluno')
                .eq('cpf_aluno', cpfAlunoNormalizado)
                .maybeSingle();

            if (errorBuscaAluno) {
                logger.error('[AlunosController][cadastrarAluno] Erro ao buscar aluno existente:', errorBuscaAluno);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                    error: 'Erro ao verificar duplicidade de CPF'
                } as CadastroAlunoResponse);
            }

            if (alunoExistente) {
                logger.warn('[AlunosController][cadastrarAluno] CPF já cadastrado:', cpfAlunoNormalizado);
                return res.status(409).json({
                    success: false,
                    message: 'CPF já cadastrado',
                    error: `Já existe um aluno cadastrado com o CPF ${requestData.aluno.cpf_aluno}`
                } as CadastroAlunoResponse);
            }

            // Buscar ou criar responsável
            let responsavel: Responsavel;
            
            if (cpfResponsavelNormalizado) {
                // Buscar responsável existente pelo CPF
                const { data: responsavelExistente, error: errorBuscaResponsavel } = await supabase
                    .from('responsaveis')
                    .select('*')
                    .eq('cpf_responsavel', cpfResponsavelNormalizado)
                    .maybeSingle();

                if (errorBuscaResponsavel) {
                    logger.error('[AlunosController][cadastrarAluno] Erro ao buscar responsável:', errorBuscaResponsavel);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor',
                        error: 'Erro ao buscar responsável'
                    } as CadastroAlunoResponse);
                }

                if (responsavelExistente) {
                    responsavel = responsavelExistente;
                    logger.info('[AlunosController][cadastrarAluno] Responsável encontrado:', responsavel.id_responsavel);
                } else {
                    // Criar novo responsável
                    responsavel = await this.criarResponsavel(requestData.responsavel, cpfResponsavelNormalizado);
                }
            } else {
                // Criar responsável sem CPF
                responsavel = await this.criarResponsavel(requestData.responsavel, null);
            }

            // Criar aluno
            const novoAluno: Partial<Aluno> = {
                nome_aluno: requestData.aluno.nome_aluno,
                data_nascimento_aluno: requestData.aluno.data_nascimento_aluno,
                cpf_aluno: cpfAlunoNormalizado,
                tipo_sanguineo: requestData.aluno.tipo_sanguineo,
                nome_guerra: requestData.aluno.nome_guerra,
                graduacao: requestData.aluno.graduacao,
                escola_unidade: requestData.aluno.escola_unidade,
                cidade: requestData.aluno.cidade,
                neurodivergente: requestData.aluno.neurodivergente || false,
                updated_at: new Date().toISOString()
            };

            const { data: alunoInserido, error: errorInsercaoAluno } = await supabase
                .from('alunos')
                .insert(novoAluno)
                .select()
                .single();

            if (errorInsercaoAluno) {
                logger.error('[AlunosController][cadastrarAluno] Erro ao inserir aluno:', errorInsercaoAluno);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                    error: 'Erro ao cadastrar aluno'
                } as CadastroAlunoResponse);
            }

            // Criar vínculo entre aluno e responsável
            const { error: errorVinculo } = await supabase
                .from('responsaveis_por_alunos')
                .insert({
                    id_aluno: alunoInserido.id_aluno,
                    id_responsavel: responsavel.id_responsavel
                });

            if (errorVinculo) {
                logger.error('[AlunosController][cadastrarAluno] Erro ao criar vínculo:', errorVinculo);
                // Tentar remover o aluno criado para manter consistência
                await supabase.from('alunos').delete().eq('id_aluno', alunoInserido.id_aluno);
                
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                    error: 'Erro ao vincular aluno ao responsável'
                } as CadastroAlunoResponse);
            }

            logger.info('[AlunosController][cadastrarAluno] Aluno cadastrado com sucesso:', alunoInserido.id_aluno);

            return res.status(201).json({
                success: true,
                message: 'Aluno cadastrado com sucesso',
                data: {
                    aluno: alunoInserido,
                    responsavel: responsavel
                }
            } as CadastroAlunoResponse);

        } catch (error) {
            logger.error('[AlunosController][cadastrarAluno] Erro inesperado:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: 'Erro inesperado ao cadastrar aluno'
            } as CadastroAlunoResponse);
        }
    }

    /**
     * Cria um novo responsável
     */
    private async criarResponsavel(dadosResponsavel: any, cpfNormalizado: string | null): Promise<Responsavel> {
        const supabase = SupabaseWrapper.get();
        
        const novoResponsavel: Partial<Responsavel> = {
            nome_responsavel: dadosResponsavel.nome_responsavel,
            telefone_responsavel: dadosResponsavel.telefone_responsavel,
            email_responsavel: dadosResponsavel.email_responsavel,
            cpf_responsavel: cpfNormalizado ?? undefined,
            update_at: new Date().toISOString()
        };

        const { data: responsavelInserido, error: errorInsercaoResponsavel } = await supabase
            .from('responsaveis')
            .insert(novoResponsavel)
            .select()
            .single();

        if (errorInsercaoResponsavel) {
            logger.error('[AlunosController][criarResponsavel] Erro ao inserir responsável:', errorInsercaoResponsavel);
            throw new Error('Erro ao cadastrar responsável');
        }

        logger.info('[AlunosController][criarResponsavel] Responsável criado:', responsavelInserido.id_responsavel);
        return responsavelInserido;
    }

    /**
     * Valida os dados da requisição de cadastro
     */
    private validateCadastroRequest(data: CadastroAlunoRequest): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validar dados do aluno
        if (!data.aluno) {
            errors.push('Dados do aluno são obrigatórios');
            return { isValid: false, errors };
        }

        if (!data.aluno.nome_aluno || data.aluno.nome_aluno.trim().length === 0) {
            errors.push('Nome do aluno é obrigatório');
        }

        if (!data.aluno.cpf_aluno || !isValidCPF(data.aluno.cpf_aluno)) {
            errors.push('CPF do aluno é obrigatório e deve ser válido');
        }

        if (!data.aluno.data_nascimento_aluno || !isValidDate(data.aluno.data_nascimento_aluno)) {
            errors.push('Data de nascimento do aluno é obrigatória e deve ser válida');
        }

        // Validar dados do responsável
        if (!data.responsavel) {
            errors.push('Dados do responsável são obrigatórios');
            return { isValid: false, errors };
        }

        if (!data.responsavel.nome_responsavel || data.responsavel.nome_responsavel.trim().length === 0) {
            errors.push('Nome do responsável é obrigatório');
        }

        if (data.responsavel.cpf_responsavel && !isValidCPF(data.responsavel.cpf_responsavel)) {
            errors.push('CPF do responsável deve ser válido quando informado');
        }

        if (data.responsavel.email_responsavel && !isValidEmail(data.responsavel.email_responsavel)) {
            errors.push('Email do responsável deve ser válido quando informado');
        }

        if (data.responsavel.telefone_responsavel && !isValidPhone(data.responsavel.telefone_responsavel)) {
            errors.push('Telefone do responsável deve ser válido quando informado');
        }

        return { isValid: errors.length === 0, errors };
    }
}