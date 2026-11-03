# API handoff

Rotas implementadas nesta branch para os épicos Pessoa e Envolvimento.

Para explorar e testar todas as rotas, importe `server/insomnia.json` no Insomnia.

**Base URL:** `http://localhost:8080`

---

## People

```
GET    /people
GET    /people/{id}
POST   /people
PUT    /people/{id}
DELETE /people/{id}
```

### Shape

```json
{
  "id": 1,
  "name": "Ana Silva",
  "cpf": "12345678901",
  "email": "ana.silva@example.com",
  "birth_date": "1990-03-15",
  "created_at": "2026-06-10T20:40:42.000000Z",
  "updated_at": null,
  "deleted_at": null
}
```

### Body (POST e PUT)

```json
{
  "name": "Ana Silva",
  "cpf": "12345678901",
  "email": "ana.silva@example.com",
  "birth_date": "1990-03-15"
}
```

### Regras

- Todos os campos são obrigatórios.
- CPF deve ter exatamente 11 dígitos numéricos.
- CPF é único no sistema. CPF duplicado retorna 409.

---

## Involvements

```
GET    /records/{record_id}/involvements
POST   /records/{record_id}/involvements
DELETE /records/{record_id}/involvements/{id}
```

### Shape de listagem

```json
{
  "involvements": [
    {
      "id": 1,
      "type": "whistleblower",
      "record_id": 1,
      "person_id": 1,
      "created_at": "2026-06-10T20:40:42.000000Z",
      "updated_at": null,
      "deleted_at": null,
      "person": {
        "id": 1,
        "name": "Ana Silva",
        "cpf": "12345678901",
        "email": "ana.silva@example.com",
        "birth_date": "1990-03-15",
        "created_at": "2026-06-10T20:40:42.000000Z",
        "updated_at": null,
        "deleted_at": null
      }
    }
  ],
  "is_anonymous": false
}
```

### Body (POST)

```json
{
  "person_id": 1,
  "type": "whistleblower"
}
```

### Enum: type

`whistleblower`, `witness`, `victim`, `denounced`

### Regras

- Todos os campos são obrigatórios.
- Uma pessoa pode aparecer apenas uma vez por relato. Duplicata retorna 409.
- `is_anonymous` é calculado pelo back-end: `true` quando o relato não tem nenhum envolvido do tipo `whistleblower`.
- `record_id` e `person_id` inválidos retornam 404.
