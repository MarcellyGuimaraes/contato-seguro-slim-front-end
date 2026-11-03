<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Record extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('records')
            ->addColumn('title', 'string', ['null' => false])
            ->addColumn('description', 'text', ['null' => false])
            ->addColumn('status', 'enum', [
                'values' => [
                    'awaiting_investigation',
                    'investigation_in_progress',
                    'resolved',
                    'archived',
                ],
                'null' => false,
            ]);

        PhinxHelper::setForeignColumn($table, 'company_id', 'companies');
        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
