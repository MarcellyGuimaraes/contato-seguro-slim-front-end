<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Person extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('people')
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('cpf', 'string', ['limit' => 11, 'null' => false])
            ->addColumn('email', 'string', ['null' => false])
            ->addColumn('birth_date', 'date', ['null' => false])
            ->addIndex('cpf', ['unique' => true]);

        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
