import { describe, expect, it } from 'vitest';

import {
    getSelectedPersonIds,
    getTypeOptions,
    hasWhistleblower,
    type InvolvementDraft,
    removeWhistleblowers,
} from './involvement-draft';

describe('getTypeOptions', () => {
    it('returns all four types when not anonymous', () => {
        expect(getTypeOptions(false).map(option => option.value))
            .toEqual(['whistleblower', 'witness', 'victim', 'denounced']);
    });

    it('omits whistleblower when anonymous', () => {
        expect(getTypeOptions(true).map(option => option.value))
            .toEqual(['witness', 'victim', 'denounced']);
    });
});

describe('hasWhistleblower', () => {
    it('is false for an empty list', () => {
        expect(hasWhistleblower([])).toBe(false);
    });

    it('is false when no row is whistleblower', () => {
        expect(hasWhistleblower([{ person_id: 1, type: 'witness' }, {}])).toBe(false);
    });

    it('is true when any row is whistleblower', () => {
        expect(hasWhistleblower([
            { person_id: 1, type: 'witness' },
            { person_id: 2, type: 'whistleblower' },
        ])).toBe(true);
    });
});

describe('removeWhistleblowers', () => {
    it('removes every whistleblower row and keeps the others in order', () => {
        const drafts: InvolvementDraft[] = [
            { person_id: 1, type: 'whistleblower' },
            { person_id: 2, type: 'witness' },
            { person_id: 3, type: 'whistleblower' },
            { person_id: 4 },
            {},
        ];

        expect(removeWhistleblowers(drafts)).toEqual([
            { person_id: 2, type: 'witness' },
            { person_id: 4 },
            {},
        ]);
    });
});

describe('getSelectedPersonIds', () => {
    it('returns only filled person ids', () => {
        expect(getSelectedPersonIds([
            { person_id: 1 },
            {},
            { type: 'victim' },
            { person_id: 3, type: 'witness' },
        ])).toEqual([1, 3]);
    });
});
