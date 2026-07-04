export type NotificationPermissionState =
  'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/** True when we should explain and ask before the first session starts. */
export function shouldPromptForPermission(): boolean {
  return getNotificationPermission() === 'default' && !wasPromptShown();
}

export function markPromptShown(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROMPT_SHOWN_KEY, 'true');
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported';
  return await Notification.requestPermission();
}

export async function notifyPhaseEnd(
  endedPhase: 'focus' | 'break',
): Promise<void> {
  if (getNotificationPermission() !== 'granted') return;
  const { title, body } = PHASE_END_MESSAGES[endedPhase];
  await showNotification(title, body);
}

const PROMPT_SHOWN_KEY = 'drift:notification-prompt-shown';

/** Same tag on both notifications so a new one replaces the previous. */
const NOTIFICATION_TAG = 'drift-phase';

const PHASE_END_MESSAGES: Record<
  'focus' | 'break',
  { title: string; body: string }
> = {
  focus: {
    title: 'Focus complete',
    body: 'Your break has started.',
  },
  break: {
    title: 'Break is over',
    body: 'Ready to start the next focus session?',
  },
};

function wasPromptShown(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(PROMPT_SHOWN_KEY) === 'true';
}

async function showNotification(title: string, body: string): Promise<void> {
  const options: NotificationOptions = {
    body,
    tag: NOTIFICATION_TAG,
    icon: `${import.meta.env.BASE_URL}icons/icon-192.png`,
  };

  // Service Worker notifications fire even when the tab isn't focused;
  // fall back to a page-scoped Notification if no SW is available.
  const registration = await getServiceWorkerRegistration();
  if (registration !== null) {
    await registration.showNotification(title, options);
    return;
  }
  new Notification(title, options);
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}
