import { type ReactNode, useState } from 'react';

import { Layout as AntdLayout, type SiderProps as AntdSiderProps } from 'antd';

export type RenderSiderProps = {
    collapsed: NonNullable<AntdSiderProps['collapsed']>,
    onCollapse: NonNullable<AntdSiderProps['onCollapse']>,
};

type Props = {
    sider: (props: RenderSiderProps) => ReactNode,
    content: () => ReactNode,
}

export function Root({ sider, content }: Props) {    
    const [collapsed, setCollapsed] = useState(false);

    return (
        <AntdLayout style={{ minHeight: '100vh' }} hasSider>
            {sider({ collapsed, onCollapse: value => setCollapsed(value) })}

            {content()}
        </AntdLayout>
    );
}
