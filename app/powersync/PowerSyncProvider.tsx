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

    connectorRef.current = new Connector(getToken);
    powersync.connect(connectorRef.current);

    return () => {
      powersync.disconnect();
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  return <PowerSyncContext.Provider value={powersync}>{children}</PowerSyncContext.Provider>;
}
