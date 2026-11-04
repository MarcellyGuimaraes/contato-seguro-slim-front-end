import type { Involvement } from './involvement.type';

export const INVOLVEMENT_TYPE_LABELS: { [K in Involvement.Type]: string } = {
    whistleblower: 'Relatante',
    witness: 'Testemunha',
    victim: 'Vítima',
    denounced: 'Denunciado',
};

export const INVOLVEMENT_TYPE_COLORS: { [K in Involvement.Type]: string } = {
    whistleblower: 'blue',
    witness: 'green',
    victim: 'orange',
    denounced: 'red',
};

export const INVOLVEMENT_TYPE_OPTIONS: { label: string; value: Involvement.Type }[] = [
    { label: INVOLVEMENT_TYPE_LABELS.whistleblower, value: 'whistleblower' },
    { label: INVOLVEMENT_TYPE_LABELS.witness, value: 'witness' },
    { label: INVOLVEMENT_TYPE_LABELS.victim, value: 'victim' },
    { label: INVOLVEMENT_TYPE_LABELS.denounced, value: 'denounced' },
];
