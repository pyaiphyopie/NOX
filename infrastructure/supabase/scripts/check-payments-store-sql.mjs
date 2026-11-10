/**
 * Local-only schema check for the NOX-7 payments store migrations.
 * Uses PGlite. Never targets a remote database.
 *
 *   NODE_PATH=/tmp/nox-pglite/node_modules node infrastructure/supabase/scripts/check-payments-store-sql.mjs
 *
 * Harness notes (not production behavior):
 * - uuid-ossp is stubbed with gen_random_uuid() because PGlite lacks that extension.
 * - 20260927 ADD VALUE is applied in a separate statement so the new enum values can be used.
 * - PGlite is single-session, so this is not a concurrent multi-backend lock test.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'migrations');
const require = createRequire(import.meta.url);

async function loadPglite() {
  const paths = [
    '@electric-sql/pglite',
    '/tmp/nox-pglite/node_modules/@electric-sql/pglite',
  ];
  for (const id of paths) {
    try {
      if (id.startsWith('/')) {
        const pkg = join(id, 'package.json');
        const { module: mod, main } = require(pkg);
        const entry = join(id, mod || main || 'dist/index.js');
        const loaded = await import(pathToFileURL(entry).href);
        return loaded.PGlite;
      }
      const loaded = await import(id);
      return loaded.PGlite;
    } catch (err) {
      continue;
    }
  }
  throw new Error('PGlite is not installed. npm install @electric-sql/pglite in /tmp/nox-pglite');
}

const bootstrap = `
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

function loadMigrations() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({ name: f, sql: readFileSync(join(migrationsDir, f), 'utf8') }));
}

async function execSql(db, sql, label) {
  try {
    await db.exec(sql);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(label + ': ' + msg);
  }
}

async function query(db, sql) {
  const res = await db.query(sql);
  return res.rows ?? res;
}

async function main() {
  const PGlite = await loadPglite();
  const db = new PGlite();
  await execSql(
    db,
    `CREATE OR REPLACE FUNCTION uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;`,
    'uuid_generate_v4 stub',
  );
  await execSql(db, bootstrap, 'bootstrap roles/auth.uid');

  function adapt(sql) {
    return sql
      .replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, '-- uuid-ossp stubbed')
      .replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/g, '-- pgcrypto stubbed');
  }

  function chunks(name, sql) {
    // PG forbids using a newly added enum value in the same transaction.
    // Split ADR-004 after the ADD VALUE blocks so PGlite can commit first.
    if (!name.startsWith('20260927')) return [sql];
    const idx = sql.indexOf('-- ---- orders ----');
    return idx < 0 ? [sql] : [sql.slice(0, idx), sql.slice(idx)];
  }

  for (const migration of loadMigrations()) {
    let part = 0;
    for (const sql of chunks(migration.name, adapt(migration.sql))) {
      part += 1;
      await execSql(db, sql, migration.name + '#' + part);
    }
    console.log('applied ' + migration.name);
  }

  const col = await query(
    db,
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name='order_items'
     ORDER BY ordinal_position`,
  );
  const cols = col.map((r) => r.column_name);
  console.log('order_items columns: ' + cols.join(', '));
  if (!cols.includes('quantity') || !cols.includes('total_price') || !cols.includes('currency')) {
    throw new Error('order_items missing expected gap-fill columns: ' + cols.join(','));
  }
  if (cols.includes('qty')) {
    throw new Error('order_items should not have a qty column on the gap-fill schema');
  }
  console.log('schema column check passed');

  const ids = {
    user: '11111111-1111-1111-1111-111111111111',
    venue: '22222222-2222-2222-2222-222222222222',
    organizer: '33333333-3333-3333-3333-333333333333',
    event: '44444444-4444-4444-4444-444444444444',
    ticket: '55555555-5555-5555-5555-555555555555',
    order: '66666666-6666-6666-6666-666666666666',
    payment: '77777777-7777-7777-7777-777777777777',
    order2: '88888888-8888-8888-8888-888888888888',
  };

  await execSql(
    db,
    `
    INSERT INTO public.users (id, phone, role) VALUES ('${ids.user}', '+959000000001', 'consumer');
    INSERT INTO public.venues (id, name, slug, address, owner_id)
      VALUES ('${ids.venue}', 'Test Venue', 'test-venue', 'Yangon', '${ids.user}');
    INSERT INTO public.organizers (id, name, slug, owner_id)
      VALUES ('${ids.organizer}', 'Test Org', 'test-org', '${ids.user}');
    INSERT INTO public.events (id, title, slug, venue_id, organizer_id, start_at, end_at, status)
      VALUES ('${ids.event}', 'Test Night', 'test-night', '${ids.venue}', '${ids.organizer}',
              NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', 'published');
    INSERT INTO public.ticket_types (id, event_id, name, price, quantity_total, is_active)
      VALUES ('${ids.ticket}', '${ids.event}', 'GA', 15000, 2, true);
    `,
    'seed rows',
  );

  const reserved = await query(db, `SELECT public.reserve_ticket_type('${ids.ticket}'::uuid, 1) AS ok`);
  if (reserved[0].ok !== true) throw new Error('reserve 1 should succeed');
  const reserved2 = await query(db, `SELECT public.reserve_ticket_type('${ids.ticket}'::uuid, 2) AS ok`);
  if (reserved2[0].ok !== false) throw new Error('reserve 2 more should fail (only 1 seat left)');
  const reserved3 = await query(db, `SELECT public.reserve_ticket_type('${ids.ticket}'::uuid, 1) AS ok`);
  if (reserved3[0].ok !== true) throw new Error('reserve last seat should succeed');
  const inv = await query(
    db,
    `SELECT quantity_reserved, quantity_sold, quantity_total FROM public.ticket_types WHERE id = '${ids.ticket}'`,
  );
  if (Number(inv[0].quantity_reserved) !== 2) throw new Error('expected 2 reserved, got ' + inv[0].quantity_reserved);

  const overRelease = await query(db, `SELECT public.release_ticket_type('${ids.ticket}'::uuid, 3) AS ok`);
  if (overRelease[0].ok !== false) throw new Error('over-release should return false');
  const inv2 = await query(db, `SELECT quantity_reserved FROM public.ticket_types WHERE id = '${ids.ticket}'`);
  if (Number(inv2[0].quantity_reserved) !== 2) {
    throw new Error('over-release stole seats, reserved=' + inv2[0].quantity_reserved);
  }

  await execSql(
    db,
    `SELECT public.save_order_with_items(
      '${ids.order}'::uuid,
      '${ids.user}'::uuid,
      '${ids.event}'::uuid,
      'payment_processing',
      15000,
      'MMK',
      1,
      '${ids.payment}'::uuid,
      '${ids.user}:k1',
      NOW() + INTERVAL '15 minutes',
      '[{"ticket_type_id":"${ids.ticket}","qty":1,"unit_price":15000}]'::jsonb,
      'insert'
    );`,
    'save_order_with_items insert',
  );

  const items = await query(
    db,
    `SELECT quantity, unit_price, total_price, currency FROM public.order_items WHERE order_id = '${ids.order}'`,
  );
  if (items.length !== 1) throw new Error('expected 1 order item');
  if (Number(items[0].quantity) !== 1 || Number(items[0].unit_price) !== 15000 || Number(items[0].total_price) !== 15000 || items[0].currency !== 'MMK') {
    throw new Error('order_items values mismatch: ' + JSON.stringify(items[0]));
  }
  console.log('save_order_with_items wrote quantity/total_price/currency');

  await execSql(
    db,
    `UPDATE public.orders SET status = 'paid' WHERE id = '${ids.order}';
     SELECT public.save_order_with_items(
      '${ids.order}'::uuid,
      '${ids.user}'::uuid,
      '${ids.event}'::uuid,
      'payment_processing',
      15000,
      'MMK',
      1,
      '${ids.payment}'::uuid,
      '${ids.user}:k1',
      NOW() + INTERVAL '15 minutes',
      '[{"ticket_type_id":"${ids.ticket}","qty":1,"unit_price":15000}]'::jsonb,
      'upsert'
    );`,
    'save_order upsert after paid',
  );
  const st = await query(db, `SELECT status FROM public.orders WHERE id = '${ids.order}'`);
  if (st[0].status !== 'paid') throw new Error('upsert downgraded paid to ' + st[0].status);
  console.log('save_order_with_items upsert retained paid status');

  await execSql(
    db,
    `SELECT public.save_payment(
      '${ids.payment}'::uuid,
      '${ids.order}'::uuid,
      'fake',
      'fake_ref_1',
      'fake',
      'MM',
      15000,
      'MMK',
      'completed',
      '${ids.user}:k1:pay',
      '{"kind":"fake_confirm"}'::jsonb,
      NOW() + INTERVAL '15 minutes',
      NULL,
      NULL
    );`,
    'save_payment completed',
  );
  await execSql(
    db,
    `SELECT public.save_payment(
      '${ids.payment}'::uuid,
      '${ids.order}'::uuid,
      'fake',
      'fake_ref_1',
      'fake',
      'MM',
      15000,
      'MMK',
      'processing',
      '${ids.user}:k1:pay',
      '{"kind":"fake_confirm"}'::jsonb,
      NOW() + INTERVAL '15 minutes',
      NULL,
      NULL
    );`,
    'save_payment processing after completed',
  );
  const pay = await query(db, `SELECT status FROM public.payments WHERE id = '${ids.payment}'`);
  if (pay[0].status !== 'completed') throw new Error('save_payment downgraded completed to ' + pay[0].status);
  console.log('save_payment retained completed status');

  const converted = await query(db, `SELECT public.convert_reserve_to_sold('${ids.ticket}'::uuid, 1) AS ok`);
  if (converted[0].ok !== true) throw new Error('convert 1 should succeed');
  const overConvert = await query(db, `SELECT public.convert_reserve_to_sold('${ids.ticket}'::uuid, 2) AS ok`);
  if (overConvert[0].ok !== false) throw new Error('convert 2 should fail (only 1 reserved left)');
  const inv3 = await query(
    db,
    `SELECT quantity_reserved, quantity_sold FROM public.ticket_types WHERE id = '${ids.ticket}'`,
  );
  if (Number(inv3[0].quantity_reserved) !== 1 || Number(inv3[0].quantity_sold) !== 1) {
    throw new Error('inventory after convert mismatch: ' + JSON.stringify(inv3[0]));
  }

  const grants = await query(
    db,
    `SELECT p.proname,
            has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
            has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec,
            has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_exec
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN (
         'reserve_ticket_type','release_ticket_type','convert_reserve_to_sold',
         'save_order_with_items','save_payment','transition_order_status'
       )
     ORDER BY p.proname`,
  );
  for (const row of grants) {
    if (row.anon_exec || row.auth_exec) {
      throw new Error(row.proname + ' is executable by anon/authenticated');
    }
    if (!row.service_exec) {
      throw new Error(row.proname + ' is not executable by service_role');
    }
  }
  console.log('RPC execute grants: service_role only (' + grants.length + ' functions)');

  const rls = await query(
    db,
    `SELECT c.relname, c.relrowsecurity
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname='public'
       AND c.relname IN ('orders','order_items','payments','tickets','ticket_types','payment_webhooks')
     ORDER BY c.relname`,
  );
  for (const row of rls) {
    if (!row.relrowsecurity) throw new Error('RLS disabled on ' + row.relname);
  }
  console.log('RLS enabled on money tables');
  console.log('payments store SQL checks passed');
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});
