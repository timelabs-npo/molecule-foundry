#!/usr/bin/env node
// Uses the protected ASC key in memory. No tokens or private key material are printed.
import { createPrivateKey, sign } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';

const required = ['ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_PRIVATE_KEY_P8_BASE64', 'APP_STORE_APP_ID'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing protected value: ${key}`);
const bundle = 'org.timelabs.moleculefoundry';
const app = process.env.APP_STORE_APP_ID;
if (!/^\d+$/.test(app)) throw new Error('APP_STORE_APP_ID must be the numeric Apple app record ID');
const key = createPrivateKey(Buffer.from(process.env.ASC_PRIVATE_KEY_P8_BASE64, 'base64'));
const b64 = input => Buffer.from(JSON.stringify(input)).toString('base64url');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const message = `${b64({ alg: 'ES256', kid: process.env.ASC_KEY_ID, typ: 'JWT' })}.${b64({ iss: process.env.ASC_ISSUER_ID, iat: now, exp: now + 300, aud: 'appstoreconnect-v1' })}`;
  return `${message}.${sign('sha256', Buffer.from(message), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}
async function read(path) {
  const response = await fetch(`https://api.appstoreconnect.apple.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${token()}`, Accept: 'application/json' },
    redirect: 'error', signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Apple read failed: HTTP ${response.status}`);
  return response.json();
}
function receipt(name, value) {
  mkdirSync('build/release', { recursive: true });
  writeFileSync(`build/release/${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
  console.log(JSON.stringify(value));
}
const record = (await read(`apps/${app}`)).data;
if (record.attributes.bundleId !== bundle) throw new Error('Apple app record belongs to another bundle identifier');
if (process.argv[2] !== 'processing') {
  receipt('apple-app-preflight', { app_id: app, bundle_identifier: bundle, app_record_verified: true });
} else {
  const build = process.env.MOLECULE_RELEASE_BUILD;
  if (!build || !/^\d+\.\d+$/.test(build)) throw new Error('Missing release build identity');
  const deadline = Date.now() + 10 * 60_000;
  let result = { app_id: app, version: '0.1.0', build, apple_processing: 'NOT_YET_VISIBLE', tester_access_verified: false };
  do {
    const query = new URLSearchParams({ 'filter[app]': app, 'filter[version]': build, include: 'preReleaseVersion', limit: '10' });
    const response = await read(`builds?${query}`);
    const rows = response.data.filter(item => {
      const id = item.relationships?.preReleaseVersion?.data?.id;
      return response.included?.some(version => version.id === id && version.type === 'preReleaseVersions' && version.attributes.version === '0.1.0');
    });
    if (rows.length > 1) throw new Error('Ambiguous Apple build identity');
    if (rows.length === 1) result = { ...result, apple_build_id: rows[0].id, apple_processing: rows[0].attributes.processingState };
    receipt('apple-processing', result);
    if (result.apple_processing === 'VALID') break;
    if (['FAILED', 'INVALID'].includes(result.apple_processing)) throw new Error(`Apple processing ${result.apple_processing}`);
    if (Date.now() >= deadline) break;
    await new Promise(resolve => setTimeout(resolve, 30_000));
  } while (Date.now() < deadline);
  if (result.apple_processing !== 'VALID') {
    console.log('Upload accepted; Apple processing remains pending. This is not tester availability.');
  }
}
