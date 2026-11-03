import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { updateCompany } from '../api/update-company.service';
import { useCompaniesContext } from '../Companies.context';
import { CompanyFields, type Values } from './CompanyFields';

export function EditCompanyModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        company,
        setIsEditModalVisible,
        setCompanyId,
        fetchCompanies,
    } = useCompaniesContext();

    if (!company)
        throw new Error('Value of the `company` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const close = () => {
        setIsEditModalVisible(false);
        setCompanyId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await updateCompany(company.id, values);

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
            title="Editar empresa"
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
                name="editCompany"
                layout="vertical"
                autoComplete="off"
                initialValues={company}
            >
                <CompanyFields />
            </Form>
        </Modal>
    );
}
