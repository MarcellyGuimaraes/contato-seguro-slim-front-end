<?php

namespace App\Models\Enums;

enum InvolvementType: string
{
    case Witness = 'witness';
    case Whistleblower = 'whistleblower';
    case Denounced = 'denounced';
    case Victim = 'victim';
}
