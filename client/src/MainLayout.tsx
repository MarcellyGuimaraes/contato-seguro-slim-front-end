import { useLocation, useNavigate, useNavigation } from 'react-router';

import { type GetProp, type MenuProps, Spin } from 'antd';

import { AuditOutlined, BuildOutlined, HomeOutlined } from '@ant-design/icons';
import { Layout } from '@domain/@shared/Layout';

type Item = NonNullable<MenuProps['items']>[number];

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const initialKey = location.pathname.split('/').slice(0, 2).join('/');

    if (navigation.state === 'loading')
        return <Spin fullscreen />;

    const dashboardItem: Item = {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/'),
    };

    const companiesItem: Item = {
        key: '/companies',
        icon: <BuildOutlined />,
        label: 'Empresas',
        onClick: () => navigate('/companies'),
    };

    const recordsItem: Item = {
        key: '/records',
        icon: <AuditOutlined />,
        label: 'Relatos',
        onClick: () => navigate('/records'),
    };

    const items = [dashboardItem, companiesItem, recordsItem];

    const sider: GetProp<typeof Layout.Root, 'sider'> = props => (
        <Layout.Sider {...props}
            items={items}
            defaultSelectedKeys={[initialKey]}
        />
    );

    return (
        <Layout.Root
            sider={sider}
            content={() => <Layout.Content />}
        />
    );
}
