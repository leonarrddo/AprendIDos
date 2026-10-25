import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationName = readdirSync(join(projectRoot, 'supabase', 'migrations'))
  .find(name => name.endsWith('_revoke_client_truncate_progresso_licoes.sql'));

test('migração remove TRUNCATE atual e dos privilégios padrão observados', () => {
  assert.ok(migrationName, 'A migração de privilégios deve existir.');
  const sql = readFileSync(join(projectRoot, 'supabase', 'migrations', migrationName), 'utf8');

  assert.match(sql, /REVOKE\s+TRUNCATE\s+ON\s+TABLE\s+public\.progresso_licoes\s+FROM\s+anon\s*,\s*authenticated\s*;/i);
  assert.match(
    sql,
    /ALTER\s+DEFAULT\s+PRIVILEGES\s+FOR\s+ROLE\s+postgres\s+IN\s+SCHEMA\s+public\s+REVOKE\s+TRUNCATE\s+ON\s+TABLES\s+FROM\s+anon\s*,\s*authenticated\s*;/i
  );
  assert.doesNotMatch(sql, /ALTER\s+DEFAULT\s+PRIVILEGES\s+FOR\s+ROLE\s+supabase_admin/i);
  assert.match(sql, /supabase_admin[\s\S]*não permite alterar esse ACL por esta migration/i);
});

test('migração preserva as permissões usadas pelo upsert e mantém o RLS', () => {
  assert.ok(migrationName, 'A migração de privilégios deve existir.');
  const sql = readFileSync(join(projectRoot, 'supabase', 'migrations', migrationName), 'utf8');

  assert.doesNotMatch(sql, /REVOKE\s+(?:ALL(?:\s+PRIVILEGES)?|SELECT|INSERT|UPDATE)\b/i);
  assert.doesNotMatch(sql, /DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  assert.doesNotMatch(sql, /DROP\s+POLICY/i);
  assert.match(sql, /has_table_privilege\('authenticated'\s*,\s*'public\.progresso_licoes'\s*,\s*'SELECT'\)/i);
  assert.match(sql, /has_table_privilege\('authenticated'\s*,\s*'public\.progresso_licoes'\s*,\s*'INSERT'\)/i);
  assert.match(sql, /has_table_privilege\('authenticated'\s*,\s*'public\.progresso_licoes'\s*,\s*'UPDATE'\)/i);
  assert.match(sql, /relrowsecurity/i);
});
