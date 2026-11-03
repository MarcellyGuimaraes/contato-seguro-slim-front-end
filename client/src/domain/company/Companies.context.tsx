import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { App } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { UnknownContextError } from '@domain/@shared/unknown-context-error';

import { listCompanies } from './api/list-companies.service';
import type { Company } from './company.type';

type Value = {
    companies: Company.Model[];
    company: Company.Model | null;
    companyId: Company.Model['id'] | null;
    setCompanyId: Dispatch<SetStateAction<Value['companyId']>>;
    isLoading: boolean;
    isCreateModalVisible: boolean;
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>;
    isEditModalVisible: boolean;
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>;
    fetchCompanies: () => Promise<void>;
};

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const CompaniesContext = createContext<Value | null>(null);

/** @see https://www.youtube.com/watch?v=I7dwJxGuGYQ */
export function CompaniesContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [companies, setCompanies] = useState<Value['companies']>([]);
    const [companyId, setCompanyId] = useState<Company.Model['id'] | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const app = App.useApp();

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);

        const response = await listCompanies();

        setIsLoading(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setCompanies(response.data.companies);
    }, [app]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const company = useMemo(() => {
        if (!companyId) return null;

        const found = companies.find(c => c.id === companyId);

        if (!found)
            throw new Error(`Could not find a company with id ${companyId}`);

        return found;
    }, [companies, companyId]);

    const value: Value = {
        isLoading,
        companies,
        company,
        companyId,
        setCompanyId,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchCompanies,
    };

    return (
        <CompaniesContext.Provider value={value}>
            {children(value)}
        </CompaniesContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompaniesContext() {
    const context = useContext(CompaniesContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
