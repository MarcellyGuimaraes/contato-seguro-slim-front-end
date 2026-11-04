import { Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';

import { formatCpf, onlyDigits } from '@domain/@shared/cpf';
import dayjs, { type Dayjs } from 'dayjs';

import type { Person } from '../person.type';

export type Values = Person.Body;

const API_DATE_FORMAT = 'YYYY-MM-DD';

export function PersonFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome completo"
                rules={[{ required: true, whitespace: true, message: 'Por favor, digite o nome completo.' }]}
            >
                <Input placeholder="Nome completo da pessoa" />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                normalize={(value: string) => onlyDigits(value ?? '')}
                getValueProps={(value?: string) => ({ value: formatCpf(value ?? '') })}
                rules={[
                    { required: true, message: 'Por favor, digite o CPF.' },
                    { pattern: /^\d{11}$/, message: 'O CPF deve ter 11 dígitos.' },
                ]}
            >
                <Input placeholder="000.000.000-00" maxLength={14} inputMode="numeric" />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite um e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' },
                ]}
            >
                <Input placeholder="E-mail de contato" />
            </Form.Item>

            <Form.Item<Values>
                name="birth_date"
                label="Data de nascimento"
                normalize={(date: Dayjs | null) => date?.format(API_DATE_FORMAT)}
                getValueProps={(value?: string) => ({ value: value ? dayjs(value, API_DATE_FORMAT) : undefined })}
                rules={[{ required: true, message: 'Por favor, selecione a data de nascimento.' }]}
            >
                <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="DD/MM/AAAA"
                    disabledDate={date => date.isAfter(dayjs(), 'day')}
                    style={{ width: '100%' }}
                />
            </Form.Item>
        </Fragment>
    );
}
