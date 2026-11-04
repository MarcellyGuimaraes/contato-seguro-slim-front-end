import { useState } from 'react';
import { useNavigate } from 'react-router';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { useCompaniesContext } from '@domain/company/Companies.context';
import { InvolvementDraftsFields } from '@domain/involvement/components/InvolvementDraftsFields';
import type { Involvement } from '@domain/involvement/involvement.type';
import type { InvolvementDraft } from '@domain/involvement/involvement-draft';

import { createRecordWithInvolvements, type NewRecord } from '../create-record-with-involvements';
import { useRecordsContext } from '../Records.context';
import { RecordFields } from './RecordFields';

type CreateValues = NewRecord & {
    is_anonymous: boolean;
    involvements: InvolvementDraft[];
};

const INITIAL_VALUES: Partial<CreateValues> = {
    is_anonymous: false,
    involvements: [],
};

function toInvolvementBodies(drafts: InvolvementDraft[]): Involvement.Body[] {
    return drafts.flatMap(({ person_id, type }) =>
        person_id !== undefined && type !== undefined ? [{ person_id, type }] : [],
    );
}

function partialFailureDescription(failedCount: number) {
    if (failedCount === 1)
        return 'Relato criado, mas 1 envolvido não foi vinculado. Confira no detalhe do relato.';

    return `Relato criado, mas ${failedCount} envolvidos não foram vinculados. Confira no detalhe do relato.`;
}

export function CreateRecordModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchRecords } = useRecordsContext();
    const { companies } = useCompaniesContext();

    const [form] = Form.useForm<CreateValues>();

    const app = App.useApp();
    const navigate = useNavigate();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async ({ title, description, company_id, involvements }: CreateValues) => {
        setIsSending(true);

        const result = await createRecordWithInvolvements(
            { title, description, company_id },
            toInvolvementBodies(involvements ?? []),
        );

        await sleep(1000);

        setIsSending(false);

        if (result.status === 'record_failed')
            return handleServiceError(app, result.response);

        close();
        fetchRecords();

        if (result.failedCount === 0)
            return;

        app.notification.warning({
            message: 'Relato criado com pendências',
            description: partialFailureDescription(result.failedCount),
        });

        navigate(`/records/${result.record.id}`);
    };

    return (
        <Modal
            open
            title="Cadastrar relato"
            width={640}
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createRecord"
                layout="vertical"
                autoComplete="off"
                initialValues={INITIAL_VALUES}
            >
                <RecordFields companies={companies} showStatus={false} />

                <Divider />

                <InvolvementDraftsFields />
            </Form>
        </Modal>
    );
}
