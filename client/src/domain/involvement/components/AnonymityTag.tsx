import { Spin, Tag, Typography } from 'antd';

import { EyeInvisibleOutlined, UserOutlined } from '@ant-design/icons';

export type AnonymityStatus = 'loading' | 'anonymous' | 'identified' | 'error';

type Props = { status: AnonymityStatus };

export function AnonymityTag({ status }: Props) {
    if (status === 'loading')
        return <Spin size="small" />;

    if (status === 'anonymous')
        return <Tag color="orange" icon={<EyeInvisibleOutlined />}>Anônimo</Tag>;

    if (status === 'identified')
        return <Tag color="blue" icon={<UserOutlined />}>Identificado</Tag>;

    return (
        <Typography.Text type="secondary" title="Não foi possível verificar">
            —
        </Typography.Text>
    );
}
