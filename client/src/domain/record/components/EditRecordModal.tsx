import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { useCompaniesContext } from '@domain/company/Companies.context';

import { updateRecord } from '../api/update-record.service';
import { useRecordsContext } from '../Records.context';
import { RecordFields, type Values } from './RecordFields';

export function EditRecordModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        record,
        setIsEditModalVisible,
        setRecordId,
        fetchRecords,
    } = useRecordsContext();

    const { companies } = useCompaniesContext();

    if (!record)
        throw new Error('Value of the `record` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const close = () => {
        setIsEditModalVisible(false);
        setRecordId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await updateRecord(record.id, values);

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
            title="Editar relato"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Confirmar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="editRecord"
                layout="vertical"
                autoComplete="off"
                initialValues={record}
            >
                <RecordFields companies={companies} />
            </Form>
        </Modal>
    );
}
