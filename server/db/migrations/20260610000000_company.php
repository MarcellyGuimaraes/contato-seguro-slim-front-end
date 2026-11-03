<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Company extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('companies')
            ->addColumn('name', 'string', ['null' => false])
            ->addColumn('cnpj', 'string', ['limit' => 14, 'null' => false])
            ->addColumn('email', 'string', ['null' => false])
            ->addIndex('cnpj', ['unique' => true]);

        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
