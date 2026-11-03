<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Involvement extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('involvements')
            ->addColumn('type', 'enum', [
                'values' => ['witness', 'whistleblower', 'denounced', 'victim'],
                'null' => false,
            ]);

        PhinxHelper::setForeignColumn($table, 'record_id', 'records');
        PhinxHelper::setForeignColumn($table, 'person_id', 'people');

        $table->addIndex(['record_id', 'person_id'], ['unique' => true]);

        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
