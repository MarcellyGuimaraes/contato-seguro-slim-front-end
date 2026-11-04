import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { App, Button, Descriptions, Result, Row, Space, Spin, Typography } from 'antd';

import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { Show } from '@domain/@shared/Show';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import type { Company } from '@domain/company/company.type';
import { type AnonymityStatus, AnonymityTag } from '@domain/involvement/components/AnonymityTag';
import { CreateInvolvementModal } from '@domain/involvement/components/CreateInvolvementModal';
import { InvolvementsTable } from '@domain/involvement/components/InvolvementsTable';
import { useRecordInvolvements } from '@domain/involvement/use-record-involvements';
import { PeopleContextProvider } from '@domain/person/People.context';
import { findRecord } from '@domain/record/api/find-record.service';
import { RECORD_STATUS_LABELS } from '@domain/record/record.constants';
import type { Record } from '@domain/record/record.type';
import dayjs from 'dayjs';

export function RecordDetail() {
    const { id } = useParams();

    return <RecordDetailView key={id} id={id} />;
}

type RecordDetailViewProps = { id: string | undefined };

function parseRecordId(id: string | undefined): Record.Model['id'] | null {
    const recordId = Number(id);

    return Number.isInteger(recordId) && recordId > 0 ? recordId : null;
}

function RecordDetailView({ id }: RecordDetailViewProps) {
    const recordId = parseRecordId(id);

    const [record, setRecord] = useState<Record.Model | null>(null);
    const [isLoading, setIsLoading] = useState(recordId !== null);
    const [isNotFound, setIsNotFound] = useState(recordId === null);

    const app = App.useApp();

    useEffect(() => {
        if (recordId === null)
            return;

        let isCancelled = false;

        const fetchRecord = async () => {
            const response = await findRecord(recordId);

            if (isCancelled)
                return;

            setIsLoading(false);

            if (hasServiceError(response)) {
                if (!(response instanceof Error) && response.statusCode === 404)
                    return setIsNotFound(true);

                return handleServiceError(app, response, translateApiError);
            }

            setRecord(response.data.record);
        };

        fetchRecord();

        return () => {
            isCancelled = true;
        };
    }, [app, recordId]);

    if (isLoading)
        return <Spin style={{ display: 'block', marginTop: 48 }} />;

    if (isNotFound)
        return (
            <Result
                status="404"
                title="Relato não encontrado"
                subTitle="O relato que você procura não existe ou foi removido."
                extra={<BackToRecordsButton />}
            />
        );

    if (!record)
        return (
            <Result
                status="warning"
                title="Não foi possível carregar o relato"
                extra={<BackToRecordsButton />}
            />
        );

    return (
        <CompaniesContextProvider>
            {({ companies }) => (
                <PeopleContextProvider>
                    {() => <RecordDetailContent record={record} companies={companies} />}
                </PeopleContextProvider>
            )}
        </CompaniesContextProvider>
    );
}

function BackToRecordsButton() {
    const navigate = useNavigate();

    return (
        <Button type="primary" onClick={() => navigate('/records')}>
            Voltar para relatos
        </Button>
    );
}

type RecordDetailContentProps = {
    record: Record.Model;
    companies: Company.Model[];
};

function RecordDetailContent({ record, companies }: RecordDetailContentProps) {
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const { involvements, isAnonymous, isLoading, fetchInvolvements } = useRecordInvolvements(record.id);

    const anonymityStatus: AnonymityStatus = isLoading
        ? 'loading'
        : isAnonymous === null
            ? 'error'
            : isAnonymous ? 'anonymous' : 'identified';

    const companyName = companies.find(company => company.id === record.company_id)?.name ?? '—';

    return (
        <Fragment>
            <main>
                <Link to="/records">
                    <ArrowLeftOutlined /> Relatos
                </Link>

                <Space align="center" wrap style={{ display: 'flex', margin: '8px 0 16px' }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        #{record.id} {record.title}
                    </Typography.Title>

                    <AnonymityTag status={anonymityStatus} />
                </Space>

                <Descriptions
                    bordered
                    column={1}
                    items={[
                        { key: 'status', label: 'Status', children: RECORD_STATUS_LABELS[record.status] ?? record.status },
                        { key: 'company', label: 'Empresa', children: companyName },
                        { key: 'created_at', label: 'Criado em', children: dayjs(record.created_at).format('DD/MM/YYYY HH:mm') },
                        { key: 'description', label: 'Descrição', children: record.description },
                    ]}
                />

                <Row justify="space-between" align="middle" style={{ marginTop: 32 }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        Envolvidos
                    </Typography.Title>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Vincular pessoa
                    </Button>
                </Row>

                <div style={{ marginTop: 16 }}>
                    <InvolvementsTable
                        involvements={involvements}
                        recordId={record.id}
                        isLoading={isLoading}
                        onChange={fetchInvolvements}
                    />
                </div>
            </main>

            <Show when={isCreateModalVisible}>
                <CreateInvolvementModal
                    recordId={record.id}
                    involvedPersonIds={involvements.map(involvement => involvement.person_id)}
                    onClose={() => setIsCreateModalVisible(false)}
                    onCreated={fetchInvolvements}
                />
            </Show>
        </Fragment>
    );
}
