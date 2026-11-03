import { Outlet } from 'react-router';

import { Layout as AntdLayout } from 'antd';

import dayjs from 'dayjs';

export function Content() {
    const currentYear = dayjs().year();

    return (
        <AntdLayout style={{ padding: '0 24px' }}>
            <AntdLayout.Content style={{ padding: 24, margin: 0, minHeight: 200 }}>
                <Outlet />
            </AntdLayout.Content>

            <AntdLayout.Footer style={{ textAlign: 'center' }}>
                Contato Seguro Slim @{currentYear}
            </AntdLayout.Footer>
        </AntdLayout>
    );
}
