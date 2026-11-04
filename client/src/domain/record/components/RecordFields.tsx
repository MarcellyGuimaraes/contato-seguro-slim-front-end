import { Fragment } from 'react';

import { Form, Input, Select } from 'antd';

import { Show } from '@domain/@shared/Show';
import type { Company } from '@domain/company/company.type';

import type { Record } from '../record.type';

const STATUS_OPTIONS: { label: string; value: Record.Status }[] = [
    { label: 'Aguardando investigação', value: 'awaiting_investigation' },
    { label: 'Investigação em andamento', value: 'investigation_in_progress' },
    { label: 'Resolvido', value: 'resolved' },
    { label: 'Arquivado', value: 'archived' },
];

export type Values = {
    title: string;
    description: string;
    status: Record.Status;
    company_id: Company.Model['id'];
};

type Props = {
    companies: Company.Model[];
    showStatus?: boolean;
};

export function RecordFields({ companies, showStatus = true }: Props) {
    return (
        <Fragment>
            <Form.Item<Values>
                name="title"
                label="Título"
                rules={[{ required: true, message: 'Por favor, digite um título.' }]}
            >
                <Input placeholder="Título do relato" />
            </Form.Item>

            <Form.Item<Values>
                name="description"
                label="Descrição"
                rules={[{ required: true, message: 'Por favor, digite uma descrição.' }]}
            >
                <Input.TextArea rows={4} placeholder="Descreva o ocorrido com o máximo de detalhes possível" />
            </Form.Item>

            <Show when={showStatus}>
                <Form.Item<Values>
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Por favor, selecione um status.' }]}
                >
                    <Select options={STATUS_OPTIONS} placeholder="Selecione um status" />
                </Form.Item>
            </Show>

            <Form.Item<Values>
                name="company_id"
                label="Empresa"
                rules={[{ required: true, message: 'Por favor, selecione uma empresa.' }]}
            >
                <Select
                    options={companies.map(c => ({ label: c.name, value: c.id }))}
                    placeholder="Selecione uma empresa"
                    showSearch
                    filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Form.Item>
        </Fragment>
    );
}
