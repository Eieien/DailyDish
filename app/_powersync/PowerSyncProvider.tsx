import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AbstractPowerSyncDatabase } from '@powersync/common';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase as PowerSyncDatabaseNative } from '@powersync/react-native';
import { useAuth } from '@clerk/clerk-expo';

import { AppSchema } from './schema';
import { Connector } from './connector';

const IS_NATIVE = Platform.OS !== 'web';

function createDatabase(): AbstractPowerSyncDatabase {
  if (!IS_NATIVE) {
    // PowerSync is native-only here — its web sync connection has never
    // reliably completed, so web reads/writes fall back to REST instead
    // (see app/powersync/writes.ts and the hooks in app/hooks/). This
    // placeholder is never queried on web.
    return {} as AbstractPowerSyncDatabase;
  }

  return new PowerSyncDatabaseNative({
    schema: AppSchema,
    database: { dbFilename: 'dailydish.sqlite' },
  });
}

export const powersync = createDatabase();

export function PowerSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const connectorRef = useRef<Connector | null>(null);

  // Clerk doesn't guarantee `getToken` stays referentially stable across
  // renders — it commonly changes around Clerk's own token-refresh cycle.
  // Keep the latest version in a ref (read at call time by the connector)
  // rather than putting it in the effect's deps below, which previously
  // caused a full disconnect+reconnect every time that reference changed,
  // not just on real sign-in/sign-out transitions.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!IS_NATIVE || !isLoaded) return;

    if (!isSignedIn) {
      // Not just disconnect() — this device's local SQLite is a single
      // shared file, not per-account. Without clearing it, a different
      // account signing in on the same device would leave the previous
      // account's synced rows sitting in local storage (invisible in the UI
      // since reads are userId-filtered, but still physically present).
      powersync.disconnectAndClear().catch((error) => {
        console.log('Failed to clear PowerSync data on sign-out:', error);
      });
      return;
    }

    console.log('[PowerSync] signed in as', userId, '— calling connect()...');
    connectorRef.current = new Connector((options) => getTokenRef.current(options));
    powersync.connect(connectorRef.current).then(
      () => console.log('[PowerSync] connect() call returned (this does not mean fully synced yet)'),
      (error) => console.log('[PowerSync] connect() rejected:', error)
    );

    return () => {
      powersync.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId]);

  return <PowerSyncContext.Provider value={powersync}>{children}</PowerSyncContext.Provider>;
}
