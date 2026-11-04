import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Button, Row, Select, Space, type TableColumnsType, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider, useCompaniesContext } from '@domain/company/Companies.context';
import { type AnonymityStatus, AnonymityTag } from '@domain/involvement/components/AnonymityTag';
import { useAnonymityByRecord } from '@domain/involvement/use-anonymity-by-record';
import { PeopleContextProvider } from '@domain/person/People.context';
import { CreateRecordModal } from '@domain/record/components/CreateRecordModal';
import { EditRecordModal } from '@domain/record/components/EditRecordModal';
import { RecordsActionsCell } from '@domain/record/components/RecordsActionsCell';
import { RECORD_STATUS_LABELS } from '@domain/record/record.constants';
import type { Record } from '@domain/record/record.type';
import { RecordsContextProvider, useRecordsContext } from '@domain/record/Records.context';

type IdentificationFilter = Extract<AnonymityStatus, 'anonymous' | 'identified'>;

const STATUS_OPTIONS = (Object.keys(RECORD_STATUS_LABELS) as Record.Status[]).map(status => ({
    label: RECORD_STATUS_LABELS[status],
    value: status,
}));

const IDENTIFICATION_OPTIONS: { label: string; value: IdentificationFilter }[] = [
    { label: 'Anônimo', value: 'anonymous' },
    { label: 'Identificado', value: 'identified' },
];

const FILTER_STYLE = { width: 240 };

export function Records() {
    return (
        <CompaniesContextProvider>
            {() => (
                <RecordsContextProvider>
                    {() => (
                        <PeopleContextProvider>
                            {() => <RecordsView />}
                        </PeopleContextProvider>
                    )}
                </RecordsContextProvider>
            )}
        </CompaniesContextProvider>
    );
}

function RecordsView() {
    const [companyFilter, setCompanyFilter] = useState<Record.Model['company_id']>();
    const [statusFilter, setStatusFilter] = useState<Record.Status>();
    const [identificationFilter, setIdentificationFilter] = useState<IdentificationFilter>();

    const {
        isLoading,
        records,
        setIsCreateModalVisible,
        isCreateModalVisible,
        isEditModalVisible,
    } = useRecordsContext();

    const { companies } = useCompaniesContext();

    const anonymityByRecord = useAnonymityByRecord(records);

    const filteredRecords = useMemo(() => records.filter(record =>
        (companyFilter === undefined || record.company_id === companyFilter)
        && (statusFilter === undefined || record.status === statusFilter)
        && (identificationFilter === undefined || anonymityByRecord.get(record.id) === identificationFilter),
    ), [records, companyFilter, statusFilter, identificationFilter, anonymityByRecord]);

    const columns: TableColumnsType<Record.Model> = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: value => `#${value}`,
        },
        {
            title: 'Título',
            dataIndex: 'title',
            render: (title, record) => <Link to={`/records/${record.id}`}>{title}</Link>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: Record.Status) => RECORD_STATUS_LABELS[status] ?? status,
        },
        {
            title: 'Identificação',
            render: (_, record) => <AnonymityTag status={anonymityByRecord.get(record.id) ?? 'loading'} />,
        },
        {
            render: (_, record) => <RecordsActionsCell record={record} />,
        },
    ];

    return (
        <Fragment>
            <main>
                <Row justify="space-between" align="middle">
                    <Typography.Title level={3}>
                        Relatos
                    </Typography.Title>

                    <Button
                        type="primary"
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Cadastrar
                    </Button>
                </Row>

                <Space wrap style={{ marginBottom: 16 }}>
                    <Select
                        placeholder="Filtrar por empresa"
                        options={companies.map(company => ({ label: company.name, value: company.id }))}
                        value={companyFilter}
                        onChange={setCompanyFilter}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        style={FILTER_STYLE}
                    />

                    <Select
                        placeholder="Filtrar por status"
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        allowClear
                        style={FILTER_STYLE}
                    />

                    <Select
                        placeholder="Filtrar por identificação"
                        options={IDENTIFICATION_OPTIONS}
                        value={identificationFilter}
                        onChange={setIdentificationFilter}
                        allowClear
                        style={FILTER_STYLE}
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredRecords}
                    loading={isLoading}
                />
            </main>

            <Show when={isCreateModalVisible}>
                <CreateRecordModal />
            </Show>

            <Show when={isEditModalVisible}>
                <EditRecordModal />
            </Show>
        </Fragment>
    );
}
