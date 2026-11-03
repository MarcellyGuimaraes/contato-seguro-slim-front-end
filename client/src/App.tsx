import { RouterProvider } from 'react-router';

import { App as AntdAppProvider } from 'antd';

import { router } from './router';

/** @see https://ant.design/components/overview/ */
export function App() {
    return (
        <AntdAppProvider>
            <RouterProvider router={router} />
        </AntdAppProvider>
    );
}
