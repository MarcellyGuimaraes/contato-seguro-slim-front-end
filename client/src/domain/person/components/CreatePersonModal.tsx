import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createPerson } from '../api/create-person.service';
import { usePeopleContext } from '../People.context';
import type { Person } from '../person.type';
import { PersonFields, type Values } from './PersonFields';

type Props = {
    onCreated?: (person: Person.Model) => void;
};

export function CreatePersonModal({ onCreated }: Props) {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchPeople } = usePeopleContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createPerson(values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        close();
        await fetchPeople();
        onCreated?.(response.data.person);
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
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
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
