import { Menu as AntdMenu, type MenuProps, theme } from 'antd';
import AntdSider from 'antd/es/layout/Sider';

import type { RenderSiderProps } from './Root';

type SiderProps = RenderSiderProps & Pick<MenuProps, 'items' | 'defaultSelectedKeys'>;

export function Sider({ collapsed, onCollapse, items, defaultSelectedKeys }: SiderProps) {
    const { token } = theme.useToken();

    return (
        <AntdSider
            width={200}
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            style={{ background: token.colorBgContainer }}
        >
            <AntdMenu
                mode="inline"
                theme="dark"
                items={items}
                defaultSelectedKeys={defaultSelectedKeys}
                style={{ height: '100%', borderRight: 0 }}
            />
        </AntdSider>
    );
}
