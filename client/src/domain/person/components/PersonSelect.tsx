import { Select } from 'antd';

import { formatCpf, onlyDigits } from '@domain/@shared/cpf';

import { usePeopleContext } from '../People.context';
import type { Person } from '../person.type';

type PersonOption = {
    value: Person.Model['id'];
    label: string;
    cpf: string;
    disabled: boolean;
};

type Props = {
    value?: Person.Model['id'];
    onChange?: (id: Person.Model['id']) => void;
    disabledPersonIds: Person.Model['id'][];
    disabledSuffix: string;
};

function filterPersonOption(input: string, option?: PersonOption) {
    if (!option)
        return false;

    const term = input.trim().toLowerCase();
    const digits = onlyDigits(input);

    return option.label.toLowerCase().includes(term)
        || (digits.length > 0 && option.cpf.includes(digits));
}

export function PersonSelect({ value, onChange, disabledPersonIds, disabledSuffix }: Props) {
    const { people, isLoading } = usePeopleContext();

    const options: PersonOption[] = people.map(person => {
        const isDisabled = disabledPersonIds.includes(person.id);

        return {
            value: person.id,
            label: `${person.name} — ${formatCpf(person.cpf)}${isDisabled ? ` ${disabledSuffix}` : ''}`,
            cpf: person.cpf,
            disabled: isDisabled,
        };
    });

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            placeholder="Busque por nome ou CPF"
            loading={isLoading}
            showSearch
            filterOption={filterPersonOption}
        />
    );
}
