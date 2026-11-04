import { useState } from 'react';

import { App, Button, Divider, Form, Modal, Select } from 'antd';

import { UserAddOutlined } from '@ant-design/icons';
import { translateApiError } from '@domain/@shared/api-error-message';
import { formatCpf, onlyDigits } from '@domain/@shared/cpf';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { Show } from '@domain/@shared/Show';
import { sleep } from '@domain/@shared/sleep';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { usePeopleContext } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';
import type { Record } from '@domain/record/record.type';

import { createInvolvement } from '../api/create-involvement.service';
import { INVOLVEMENT_TYPE_OPTIONS } from '../involvement.constants';
import type { Involvement } from '../involvement.type';

type Values = Involvement.Body;

type PersonOption = {
    value: Person.Model['id'];
    label: string;
    cpf: string;
    disabled: boolean;
};

type Props = {
    recordId: Record.Model['id'];
    involvedPersonIds: Person.Model['id'][];
    onClose: () => void;
    onCreated: () => void;
};

export function CreateInvolvementModal({ recordId, involvedPersonIds, onClose, onCreated }: Props) {
    const [isSending, setIsSending] = useState(false);

    const {
        people,
        isLoading: isLoadingPeople,
        isCreateModalVisible: isCreatePersonModalVisible,
        setIsCreateModalVisible: setIsCreatePersonModalVisible,
    } = usePeopleContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const personOptions: PersonOption[] = people.map(person => {
        const isInvolved = involvedPersonIds.includes(person.id);

        return {
            value: person.id,
            label: `${person.name} — ${formatCpf(person.cpf)}${isInvolved ? ' (já vinculada)' : ''}`,
            cpf: person.cpf,
            disabled: isInvolved,
        };
    });

    const filterPersonOption = (input: string, option?: PersonOption) => {
        if (!option)
            return false;

        const term = input.trim().toLowerCase();
        const digits = onlyDigits(input);

        return option.label.toLowerCase().includes(term)
            || (digits.length > 0 && option.cpf.includes(digits));
    };

    const handlePersonCreated = (person: Person.Model) => {
        form.setFieldValue('person_id', person.id);
        form.validateFields(['person_id']);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createInvolvement(recordId, values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        onCreated();
        onClose();
    };

    return (
        <Modal
            open
            title="Vincular pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Vincular"
            onCancel={onClose}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createInvolvement"
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item<Values>
                    name="person_id"
                    label="Pessoa"
                    rules={[{ required: true, message: 'Por favor, selecione a pessoa.' }]}
                    extra={(
                        <Button
                            type="link"
                            icon={<UserAddOutlined />}
                            style={{ padding: 0 }}
                            onClick={() => setIsCreatePersonModalVisible(true)}
                        >
                            Cadastrar nova pessoa
                        </Button>
                    )}
                >
                    <Select
                        options={personOptions}
                        placeholder="Busque por nome ou CPF"
                        loading={isLoadingPeople}
                        showSearch
                        filterOption={filterPersonOption}
                    />
                </Form.Item>

                <Form.Item<Values>
                    name="type"
                    label="Tipo de envolvimento"
                    rules={[{ required: true, message: 'Por favor, selecione o tipo de envolvimento.' }]}
                >
                    <Select
                        options={INVOLVEMENT_TYPE_OPTIONS}
                        placeholder="Selecione o tipo"
                    />
                </Form.Item>
            </Form>

            <Show when={isCreatePersonModalVisible}>
                <CreatePersonModal onCreated={handlePersonCreated} />
            </Show>
        </Modal>
    );
}
