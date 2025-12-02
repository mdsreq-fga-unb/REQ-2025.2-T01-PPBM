export interface Aluno {
    id_aluno?: number;
    nome_aluno: string;
    data_nascimento_aluno: string; // ISO date string
    cpf_aluno: string;
    tipo_sanguineo?: string;
    nome_guerra?: string;
    graduacao?: string;
    escola_unidade?: string;
    cidade?: string;
    neurodivergente?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Responsavel {
    id_responsavel?: number;
    nome_responsavel: string;
    telefone_responsavel?: string;
    email_responsavel?: string;
    cpf_responsavel?: string;
    created_at?: string;
    update_at?: string;
}

export interface CadastroAlunoRequest {
    aluno: {
        nome_aluno: string;
        data_nascimento_aluno: string;
        cpf_aluno: string;
        tipo_sanguineo?: string;
        nome_guerra?: string;
        graduacao?: string;
        escola_unidade?: string;
        cidade?: string;
        neurodivergente?: boolean;
        turma_id?: number | string;
    };
    responsavel: {
        id_responsavel?: number;
        nome_responsavel: string;
        telefone_responsavel?: string;
        email_responsavel?: string;
        cpf_responsavel?: string;
    };
}

export interface CadastroAlunoResponse {
    success: boolean;
    message: string;
    data?: {
        aluno: Aluno;
        responsavel: Responsavel;
    };
    error?: string;
}