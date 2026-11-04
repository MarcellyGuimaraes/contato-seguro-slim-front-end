import { Fragment } from 'react';

import { Button, Flex, Form, Select, Space, Switch, Typography } from 'antd';

import { DeleteOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { Show } from '@domain/@shared/Show';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { PersonSelect } from '@domain/person/components/PersonSelect';
import { usePeopleContext } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';

import {
    getSelectedPersonIds,
    getTypeOptions,
    hasWhistleblower,
    type InvolvementDraft,
    removeWhistleblowers,
} from '../involvement-draft';

type Values = {
    is_anonymous: boolean;
    involvements: InvolvementDraft[];
};

const MISSING_WHISTLEBLOWER_MESSAGE = 'Informe pelo menos um relatante ou marque o relato como anônimo.';

export function InvolvementDraftsFields() {
    const form = Form.useFormInstance<Values>();

    const isAnonymous = Form.useWatch('is_anonymous', form) ?? false;
    const drafts: InvolvementDraft[] = Form.useWatch('involvements', form) ?? [];

    const {
        isCreateModalVisible: isCreatePersonModalVisible,
        setIsCreateModalVisible: setIsCreatePersonModalVisible,
    } = usePeopleContext();

    const revalidateListIfShowingError = () => {
        if (form.getFieldError('involvements').length > 0)
            form.validateFields(['involvements']);
    };

    const handleAnonymousChange = (checked: boolean) => {
        if (checked)
            form.setFieldValue('involvements', removeWhistleblowers(form.getFieldValue('involvements') ?? []));

        revalidateListIfShowingError();
    };

    const handlePersonCreated = (person: Person.Model) => {
        const current: InvolvementDraft[] = form.getFieldValue('involvements') ?? [];

        form.setFieldValue('involvements', [...current, { person_id: person.id }]);
    };

    const otherRowsPersonIds = (index: number) =>
        getSelectedPersonIds(drafts.filter((_, draftIndex) => draftIndex !== index));

    return (
        <Fragment>
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Typography.Text strong>Envolvidos</Typography.Text>

                <Space>
                    <Typography.Text>Anônimo</Typography.Text>

                    <Form.Item<Values> name="is_anonymous" valuePropName="checked" noStyle>
                        <Switch onChange={handleAnonymousChange} />
                    </Form.Item>
                </Space>
            </Flex>

            <Form.List
                name="involvements"
                rules={[{
                    validator: async (_, rows: InvolvementDraft[] = []) => {
                        if (!form.getFieldValue('is_anonymous') && !hasWhistleblower(rows))
                            throw new Error(MISSING_WHISTLEBLOWER_MESSAGE);
                    },
                }]}
            >
                {(fields, { add, remove }, { errors }) => (
                    <Fragment>
                        {fields.map((field, index) => (
                            <Flex key={field.key} gap={8} align="start">
                                <Form.Item
                                    name={[field.name, 'person_id']}
                                    rules={[{ required: true, message: 'Por favor, selecione a pessoa.' }]}
                                    style={{ flex: 2 }}
                                >
                                    <PersonSelect
                                        disabledPersonIds={otherRowsPersonIds(index)}
                                        disabledSuffix="(já selecionada)"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name={[field.name, 'type']}
                                    rules={[{ required: true, message: 'Por favor, selecione o tipo de envolvimento.' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Select
                                        options={getTypeOptions(isAnonymous)}
                                        placeholder="Tipo"
                                        onChange={revalidateListIfShowingError}
                                    />
                                </Form.Item>

                                <Button
                                    icon={<DeleteOutlined />}
                                    aria-label="Remover envolvido"
                                    onClick={() => {
                                        remove(field.name);
                                        revalidateListIfShowingError();
                                    }}
                                />
                            </Flex>
                        ))}

                        <Space wrap>
                            <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})}>
                                Adicionar envolvido
                            </Button>

                            <Button
                                type="link"
                                icon={<UserAddOutlined />}
                                onClick={() => setIsCreatePersonModalVisible(true)}
                            >
                                Cadastrar nova pessoa
                            </Button>
                        </Space>

                        <Form.ErrorList errors={errors} />
                    </Fragment>
                )}
            </Form.List>

            <Show when={isCreatePersonModalVisible}>
                <CreatePersonModal onCreated={handlePersonCreated} />
            </Show>
        </Fragment>
    );
}
