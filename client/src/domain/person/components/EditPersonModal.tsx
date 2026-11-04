import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { updatePerson } from '../api/update-person.service';
import { usePeopleContext } from '../People.context';
import { PersonFields, type Values } from './PersonFields';

export function EditPersonModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        person,
        setIsEditModalVisible,
        setPersonId,
        fetchPeople,
    } = usePeopleContext();

    if (!person)
        throw new Error('Value of the `person` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const close = () => {
        setIsEditModalVisible(false);
        setPersonId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await updatePerson(person.id, values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Editar pessoa"
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
                name="editPerson"
                layout="vertical"
                autoComplete="off"
                initialValues={person}
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
