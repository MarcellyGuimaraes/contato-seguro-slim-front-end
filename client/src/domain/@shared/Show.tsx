import { Fragment, type ReactNode } from 'react';

type Props = {
    when: boolean,
    children: ReactNode,
}

export function Show({ when, children }: Props) {
    if (!when)
        return null;

    return <Fragment>{children}</Fragment>;
}
