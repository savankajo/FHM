'use client';

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Browser } from '@capacitor/browser';

let listenersReady = false;
let currentToken: string | null = null;

function isNativeIos() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

async function saveToken(token: string) {
  currentToken = token;
  const response = await fetch('/api/push/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok && response.status !== 401) throw new Error('Could not register this device.');
}

async function openNotificationHref(href: unknown) {
  if (typeof href !== 'string' || !href) return;
  if (/^https?:\/\//i.test(href)) {
    await Browser.open({ url: href });
    return;
  }
  if (href.startsWith('/')) window.location.assign(href);
}

async function ensureListeners() {
  if (listenersReady || !isNativeIos()) return;
  listenersReady = true;

  await PushNotifications.addListener('registration', token => {
    void saveToken(token.value).catch(error => console.error('Push registration failed:', error));
  });
  await PushNotifications.addListener('registrationError', error => {
    console.error('APNs registration failed:', error.error);
  });
  await PushNotifications.addListener('pushNotificationActionPerformed', action => {
    void openNotificationHref(action.notification.data?.href);
  });
}

export async function registerPushIfAlreadyAllowed() {
  if (!isNativeIos()) return 'unavailable' as const;
  await ensureListeners();
  const permission = await PushNotifications.checkPermissions();
  if (permission.receive !== 'granted') return permission.receive;
  await PushNotifications.register();
  return 'granted' as const;
}

export async function requestPushPermission() {
  if (!isNativeIos()) return { status: 'unavailable' as const, message: 'Device notifications are available in the installed iPhone or iPad app.' };
  await ensureListeners();
  let permission = await PushNotifications.checkPermissions();
  if (permission.receive !== 'granted') permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') {
    return { status: 'denied' as const, message: 'Notifications are off. You can enable them later in iOS Settings.' };
  }
  await PushNotifications.register();
  return { status: 'granted' as const, message: 'Device notifications enabled.' };
}

export async function unregisterPushForCurrentDevice() {
  if (!isNativeIos()) return;
  if (currentToken) {
    await fetch('/api/push/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: currentToken }),
    }).catch(() => undefined);
  }
  await PushNotifications.unregister().catch(() => undefined);
  currentToken = null;
}
