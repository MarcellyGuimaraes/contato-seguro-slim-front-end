import { useState } from 'react';

import { App, Button, Popconfirm, Space } from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { deletePerson } from '../api/delete-person.service';
import { usePeopleContext } from '../People.context';
import type { Person } from '../person.type';

type Props = { person: Person.Model };

export function PeopleActionsCell({ person }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { setPersonId, setIsEditModalVisible, fetchPeople } = usePeopleContext();

    const app = App.useApp();

    const handleEdit = () => {
        setPersonId(person.id);
        setIsEditModalVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deletePerson(person.id);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        setIsPopconfirmVisible(false);
        fetchPeople();
    };

    return (
        <Space size="middle">
            <Button
                type="text"
                icon={<EditOutlined />}
                title="Editar"
                onClick={handleEdit}
            />

            <Popconfirm
                title="Excluir pessoa"
                description="Tem certeza que deseja excluir esta pessoa? Ela continuará aparecendo nos relatos aos quais está vinculada."
                open={isPopconfirmVisible}
                placement="left"
                cancelText="Não"
                okText="Sim"
                okType="danger"
                okButtonProps={{ loading: isSending }}
                onConfirm={handleDelete}
                onCancel={() => setIsPopconfirmVisible(false)}
            >
                <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Excluir"
                    onClick={() => setIsPopconfirmVisible(true)}
                />
            </Popconfirm>
        </Space>
    );
}
