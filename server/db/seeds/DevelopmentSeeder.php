<?php

use Phinx\Seed\AbstractSeed;

class DevelopmentSeeder extends AbstractSeed
{
    public function run(): void
    {
        $this->table('companies')->insert([
            [
                'name' => 'Vega Soluções S.A.',
                'cnpj' => '11111111000191',
                'email' => 'contato@vegasolucoes.example.com',
            ],
            [
                'name' => 'Rigel Serviços Ltda.',
                'cnpj' => '22222222000100',
                'email' => 'contato@rigelservicos.example.com',
            ],
        ])->saveData();

        $this->table('records')->insert([
            [
                'title' => 'Descumprimento de política de privacidade de dados',
                'description' => 'Relato anônimo sobre descumprimento de política de privacidade de dados por parte de colaborador do setor administrativo.',
                'status' => 'awaiting_investigation',
                'company_id' => 1,
            ],
            [
                'title' => 'Acesso não autorizado a sistema interno',
                'description' => 'Suspeita de acesso não autorizado a sistema interno por usuário sem permissão para o módulo em questão.',
                'status' => 'investigation_in_progress',
                'company_id' => 1,
            ],
            [
                'title' => 'Descumprimento de norma de segurança',
                'description' => 'Caso de descumprimento de norma de segurança identificado e encerrado após treinamento obrigatório aplicado à equipe.',
                'status' => 'resolved',
                'company_id' => 2,
            ],
        ])->saveData();

        $people = [
            [
                'name' => 'Ana Silva',
                'cpf' => '12345678901',
                'email' => 'ana.silva@example.com',
                'birth_date' => '1990-03-15',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Bruno Costa',
                'cpf' => '98765432100',
                'email' => 'bruno.costa@example.com',
                'birth_date' => '1985-07-22',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Carla Mendes',
                'cpf' => '11122233344',
                'email' => 'carla.mendes@example.com',
                'birth_date' => '1995-11-08',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->table('people')->insert($people)->saveData();

        $involvements = [
            [
                'record_id' => 1,
                'person_id' => 1,
                'type' => 'whistleblower',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'record_id' => 1,
                'person_id' => 2,
                'type' => 'denounced',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'record_id' => 2,
                'person_id' => 3,
                'type' => 'witness',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];

        $this->table('involvements')->insert($involvements)->saveData();
    }
}
