import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { useCompaniesContext } from '@domain/company/Companies.context';

import { createRecord } from '../api/create-record.service';
import { useRecordsContext } from '../Records.context';
import { RecordFields, type Values } from './RecordFields';

export function CreateRecordModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchRecords } = useRecordsContext();
    const { companies } = useCompaniesContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createRecord(values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        close();
        fetchRecords();
    };

    return (
        <Modal
            open
            title="Cadastrar relato"
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
            >
                <RecordFields companies={companies} />
            </Form>
        </Modal>
    );
}
