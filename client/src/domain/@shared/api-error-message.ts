import type { MakeMessage } from './service.helper';

const MESSAGES: { [description: string]: string } = {
    'CPF already registered': 'Este CPF já está cadastrado.',
    'Invalid CPF format. Must be 11 digits': 'O CPF deve ter 11 dígitos.',
    'Invalid email format': 'E-mail inválido.',
    'Invalid birth date format': 'Data de nascimento inválida.',
    'Name is required': 'Nome é obrigatório.',
    'CPF is required': 'CPF é obrigatório.',
    'Email is required': 'E-mail é obrigatório.',
    'Birth date is required': 'Data de nascimento é obrigatória.',
    'Person not found': 'Pessoa não encontrada.',
    'Record not found': 'Relato não encontrado.',
    'Involvement not found': 'Vínculo não encontrado.',
    'Person already involved in this record': 'Esta pessoa já está vinculada a este relato.',
    'Person ID is required': 'Selecione a pessoa.',
    'Type is required': 'Selecione o tipo de envolvimento.',
};

const INVALID_TYPE_PREFIX = 'Invalid type.';

const SERVER_ERROR_MESSAGE = 'Não foi possível concluir a operação. Se a pessoa ou o vínculo já foi removido antes, o sistema pode estar impedindo o recadastro.';

export const translateApiError: MakeMessage = ({ statusCode, error }) => {
    const translated = MESSAGES[error.description];

    if (translated !== undefined)
        return translated;

    if (error.description.startsWith(INVALID_TYPE_PREFIX))
        return 'Tipo de envolvimento inválido.';

    if (statusCode >= 500)
        return SERVER_ERROR_MESSAGE;

    return null;
};
