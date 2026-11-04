import { createBrowserRouter } from 'react-router';

import { Companies } from '@pages/Companies.page';
import { Dashboard } from '@pages/Dashboard.page';
import { People } from '@pages/People.page';
import { RecordDetail } from '@pages/RecordDetail.page';
import { Records } from '@pages/Records.page';

import { MainLayout } from './MainLayout';

/** @see https://reactrouter.com/start/data/routing */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: '/companies',
                element: <Companies />,
            },
            {
                path: '/people',
                element: <People />,
            },
            {
                path: '/records',
                element: <Records />,
            },
            {
                path: '/records/:id',
                element: <RecordDetail />,
            },
        ],
    },
]);
