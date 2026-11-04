const CPF_LENGTH = 11;

export function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
    const digits = onlyDigits(value).slice(0, CPF_LENGTH);

    let formatted = digits.slice(0, 3);

    if (digits.length > 3)
        formatted += `.${digits.slice(3, 6)}`;

    if (digits.length > 6)
        formatted += `.${digits.slice(6, 9)}`;

    if (digits.length > 9)
        formatted += `-${digits.slice(9, 11)}`;

    return formatted;
}

export function maskCpf(value: string): string {
    const digits = onlyDigits(value);

    if (digits.length !== CPF_LENGTH)
        return '***.***.***-**';

    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}
