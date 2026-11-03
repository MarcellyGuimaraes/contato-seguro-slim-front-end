export namespace Record {
    export type Status =
        | 'awaiting_investigation'
        | 'investigation_in_progress'
        | 'resolved'
        | 'archived';

    export type Model = {
        id: number;
        title: string;
        description: string;
        status: Status;
        company_id: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
}
