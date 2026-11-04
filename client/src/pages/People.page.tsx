import { Fragment, useState } from 'react';

import { Button, Input, Row, type TableColumnsType, Typography } from 'antd';

import { maskCpf, onlyDigits } from '@domain/@shared/cpf';
import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleActionsCell } from '@domain/person/components/PeopleActionsCell';
import { PeopleContextProvider } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';
import dayjs from 'dayjs';

const COLUMNS: TableColumnsType<Person.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
        render: value => maskCpf(value),
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Nascimento',
        dataIndex: 'birth_date',
        render: value => dayjs(value, 'YYYY-MM-DD').format('DD/MM/YYYY'),
    },
    {
        render: (_, person) => <PeopleActionsCell person={person} />,
    },
];

function filterPeople(people: Person.Model[], search: string) {
    const term = search.trim().toLowerCase();

    if (!term)
        return people;

    const digits = onlyDigits(term);

    return people.filter(person =>
        person.name.toLowerCase().includes(term)
        || (digits.length > 0 && person.cpf.includes(digits)),
    );
}

export function People() {
    const [search, setSearch] = useState('');

    return (
        <PeopleContextProvider>
            {({
                isLoading,
                people,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Pessoas
                            </Typography.Title>

                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                            >
                                Cadastrar
                            </Button>
                        </Row>

                        <Input.Search
                            placeholder="Buscar por nome ou CPF"
                            allowClear
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            style={{ maxWidth: 360, marginBottom: 16 }}
                        />

                        <Table
                            columns={COLUMNS}
                            dataSource={filterPeople(people, search)}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreatePersonModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditPersonModal />
                    </Show>
                </Fragment>
            )}
        </PeopleContextProvider>
    );
}
