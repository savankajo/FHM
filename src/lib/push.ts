import { connect, type ClientHttp2Session, type IncomingHttpHeaders } from 'node:http2';
import { sign } from 'jsonwebtoken';

export type PushPayload = {
  title: string;
  body: string;
  href?: string | null;
  category: string;
};

export type PushDelivery = {
  token: string;
  ok: boolean;
  invalid: boolean;
  error?: string;
};

type ApnsConfig = {
  keyId: string;
  teamId: string;
  privateKey: string;
  bundleId: string;
  origin: string;
};

let cachedProviderToken: { value: string; createdAt: number } | null = null;

function getApnsConfig(): ApnsConfig | null {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const bundleId = process.env.APNS_BUNDLE_ID || 'com.savankajo.fhm';
  if (!keyId || !teamId || !privateKey) return null;

  return {
    keyId,
    teamId,
    privateKey,
    bundleId,
    origin: process.env.APNS_PRODUCTION === 'false'
      ? 'https://api.sandbox.push.apple.com'
      : 'https://api.push.apple.com',
  };
}

function providerToken(config: ApnsConfig) {
  const now = Date.now();
  if (cachedProviderToken && now - cachedProviderToken.createdAt < 50 * 60 * 1000) {
    return cachedProviderToken.value;
  }

  const value = sign({}, config.privateKey, {
    algorithm: 'ES256',
    issuer: config.teamId,
    keyid: config.keyId,
  });
  cachedProviderToken = { value, createdAt: now };
  return value;
}

function sendOne(
  client: ClientHttp2Session,
  config: ApnsConfig,
  authorization: string,
  token: string,
  payload: PushPayload,
): Promise<PushDelivery> {
  return new Promise(resolve => {
    const request = client.request({
      ':method': 'POST',
      ':path': `/3/device/${token}`,
      authorization: `bearer ${authorization}`,
      'apns-topic': config.bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'apns-expiration': '0',
      'content-type': 'application/json',
    });

    let responseHeaders: IncomingHttpHeaders = {};
    let responseBody = '';
    request.setEncoding('utf8');
    request.on('response', headers => { responseHeaders = headers; });
    request.on('data', chunk => { responseBody += chunk; });
    request.on('error', error => resolve({ token, ok: false, invalid: false, error: error.message }));
    request.on('end', () => {
      const status = Number(responseHeaders[':status'] || 500);
      if (status === 200) return resolve({ token, ok: true, invalid: false });

      let reason = `APNs returned ${status}`;
      try {
        const parsed = JSON.parse(responseBody) as { reason?: string };
        if (parsed.reason) reason = parsed.reason;
      } catch {
        // APNs can return an empty body for transport failures.
      }
      const invalid = status === 410 || ['BadDeviceToken', 'DeviceTokenNotForTopic', 'Unregistered'].includes(reason);
      resolve({ token, ok: false, invalid, error: reason });
    });

    request.end(JSON.stringify({
      aps: {
        alert: { title: payload.title, body: payload.body },
        sound: 'default',
        'thread-id': payload.category,
      },
      href: payload.href || '/',
      category: payload.category,
    }));
  });
}

export async function sendPushToDevices(tokens: string[], payload: PushPayload) {
  const config = getApnsConfig();
  if (!config || tokens.length === 0) {
    return { configured: Boolean(config), deliveries: [] as PushDelivery[] };
  }

  const client = connect(config.origin);
  const connectionError = new Promise<never>((_, reject) => {
    client.once('error', reject);
  });

  try {
    const authorization = providerToken(config);
    const deliveries = await Promise.race([
      Promise.all(tokens.map(token => sendOne(client, config, authorization, token, payload))),
      connectionError,
    ]);
    return { configured: true, deliveries };
  } finally {
    client.close();
  }
}
