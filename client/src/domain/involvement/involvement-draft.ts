import type { Person } from '@domain/person/person.type';

import { INVOLVEMENT_TYPE_OPTIONS } from './involvement.constants';
import type { Involvement } from './involvement.type';

export type InvolvementDraft = {
    person_id?: Person.Model['id'];
    type?: Involvement.Type;
};

export function getTypeOptions(isAnonymous: boolean) {
    if (!isAnonymous)
        return INVOLVEMENT_TYPE_OPTIONS;

    return INVOLVEMENT_TYPE_OPTIONS.filter(option => option.value !== 'whistleblower');
}

export function hasWhistleblower(drafts: InvolvementDraft[]): boolean {
    return drafts.some(draft => draft.type === 'whistleblower');
}

export function removeWhistleblowers(drafts: InvolvementDraft[]): InvolvementDraft[] {
    return drafts.filter(draft => draft.type !== 'whistleblower');
}

export function getSelectedPersonIds(drafts: InvolvementDraft[]): Person.Model['id'][] {
    return drafts.flatMap(draft => draft.person_id === undefined ? [] : [draft.person_id]);
}
