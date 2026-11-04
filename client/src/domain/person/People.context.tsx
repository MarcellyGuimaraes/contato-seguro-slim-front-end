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

import { translateApiError } from '@domain/@shared/api-error-message';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { UnknownContextError } from '@domain/@shared/unknown-context-error';

import { listPeople } from './api/list-people.service';
import type { Person } from './person.type';

type Value = {
    people: Person.Model[];
    person: Person.Model | null;
    personId: Person.Model['id'] | null;
    setPersonId: Dispatch<SetStateAction<Value['personId']>>;
    isLoading: boolean;
    isCreateModalVisible: boolean;
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>;
    isEditModalVisible: boolean;
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>;
    fetchPeople: () => Promise<void>;
};

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const PeopleContext = createContext<Value | null>(null);

export function PeopleContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [people, setPeople] = useState<Value['people']>([]);
    const [personId, setPersonId] = useState<Person.Model['id'] | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const app = App.useApp();

    const fetchPeople = useCallback(async () => {
        setIsLoading(true);

        const response = await listPeople();

        setIsLoading(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, translateApiError);

        setPeople(response.data.people);
    }, [app]);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    const person = useMemo(() => {
        if (!personId) return null;

        const found = people.find(p => p.id === personId);

        if (!found)
            throw new Error(`Could not find a person with id ${personId}`);

        return found;
    }, [people, personId]);

    const value: Value = {
        isLoading,
        people,
        person,
        personId,
        setPersonId,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchPeople,
    };

    return (
        <PeopleContext.Provider value={value}>
            {children(value)}
        </PeopleContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePeopleContext() {
    const context = useContext(PeopleContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
