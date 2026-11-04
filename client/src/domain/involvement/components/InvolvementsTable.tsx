import { useState } from 'react';

import { App, Button, Popconfirm, type TableColumnsType, Tag, Typography } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { translateApiError } from '@domain/@shared/api-error-message';
import { formatCpf } from '@domain/@shared/cpf';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { Table } from '@domain/@shared/Table';
import type { Record } from '@domain/record/record.type';

import { deleteInvolvement } from '../api/delete-involvement.service';
import { INVOLVEMENT_TYPE_COLORS, INVOLVEMENT_TYPE_LABELS } from '../involvement.constants';
import type { Involvement } from '../involvement.type';

type Props = {
    involvements: Involvement.Model[];
    recordId: Record.Model['id'];
    isLoading: boolean;
    onChange: () => void;
};

export function InvolvementsTable({ involvements, recordId, isLoading, onChange }: Props) {
    const columns: TableColumnsType<Involvement.Model> = [
        {
            title: 'Nome',
            render: (_, { person }) => person
                ? person.name
                : <Typography.Text type="secondary">Pessoa removida</Typography.Text>,
        },
        {
            title: 'CPF',
            render: (_, { person }) => person ? formatCpf(person.cpf) : '—',
        },
        {
            title: 'E-mail',
            render: (_, { person }) => person ? person.email : '—',
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            render: (type: Involvement.Type) => (
                <Tag color={INVOLVEMENT_TYPE_COLORS[type]}>
                    {INVOLVEMENT_TYPE_LABELS[type]}
                </Tag>
            ),
        },
        {
            render: (_, involvement) => (
                <RemoveInvolvementCell
                    involvement={involvement}
                    recordId={recordId}
                    onRemoved={onChange}
                />
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={involvements}
            loading={isLoading}
        />
    );
}

type RemoveInvolvementCellProps = {
    involvement: Involvement.Model;
    recordId: Record.Model['id'];
    onRemoved: () => void;
};

function RemoveInvolvementCell({ involvement, recordId, onRemoved }: RemoveInvolvementCellProps) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const app = App.useApp();

    const handleRemove = async () => {
        setIsSending(true);

        const response = await deleteInvolvement(recordId, involvement.id);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        setIsPopconfirmVisible(false);
        onRemoved();
    };

    return (
        <Popconfirm
            title="Remover vínculo"
            description="Tem certeza que deseja remover esta pessoa do relato?"
            open={isPopconfirmVisible}
            placement="left"
            cancelText="Não"
            okText="Sim"
            okType="danger"
            okButtonProps={{ loading: isSending }}
            onConfirm={handleRemove}
            onCancel={() => setIsPopconfirmVisible(false)}
        >
            <Button
                type="text"
                icon={<DeleteOutlined />}
                title="Remover"
                onClick={() => setIsPopconfirmVisible(true)}
            />
        </Popconfirm>
    );
}
