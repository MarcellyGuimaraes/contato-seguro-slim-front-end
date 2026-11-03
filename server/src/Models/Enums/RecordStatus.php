<?php

namespace App\Models\Enums;

enum RecordStatus: string
{
    case AwaitingInvestigation = 'awaiting_investigation';
    case InvestigationInProgress = 'investigation_in_progress';
    case Resolved = 'resolved';
    case Archived = 'archived';
}
