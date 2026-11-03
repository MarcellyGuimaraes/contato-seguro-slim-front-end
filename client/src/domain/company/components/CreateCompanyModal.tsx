import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createCompany } from '../api/create-company.service';
import { useCompaniesContext } from '../Companies.context';
import { CompanyFields, type Values } from './CompanyFields';

export function CreateCompanyModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchCompanies } = useCompaniesContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createCompany(values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        close();
        fetchCompanies();
    };

    return (
        <Modal
            open
            title="Cadastrar empresa"
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
                name="createCompany"
                layout="vertical"
                autoComplete="off"
            >
                <CompanyFields />
            </Form>
        </Modal>
    );
}
