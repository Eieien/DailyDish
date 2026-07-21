import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { useStatus } from "@powersync/react";
import { useAuth } from "@clerk/clerk-expo";

function NativeSyncStatusBanner() {
  const { isSignedIn } = useAuth();
  const status = useStatus();
  const pending = status?.dataFlowStatus?.uploading ?? false;

  useEffect(() => {
    if (!status) return;
    console.log(
      '[PowerSync] status:',
      JSON.stringify({
        connected: status.connected,
        connecting: status.connecting,
        hasSynced: status.hasSynced,
        downloading: status.dataFlowStatus?.downloading,
        uploading: status.dataFlowStatus?.uploading,
        downloadError: status.dataFlowStatus?.downloadError?.message ?? status.dataFlowStatus?.downloadError,
        uploadError: status.dataFlowStatus?.uploadError?.message ?? status.dataFlowStatus?.uploadError,
      })
    );
  }, [status]);

  // PowerSync only connects once signed in — showing "Offline" while not yet
  // authenticated (e.g. on the sign-in screen) is a false alarm, not a real
  // connectivity problem.
  if (!isSignedIn || (status?.connected && !pending)) return null;

  return (
    <View className="items-center bg-[#2B2320] py-1.5">
      <Text className="text-[11px] font-semibold text-white">
        {status?.connected ? "Syncing changes…" : "Offline — changes will sync when back online"}
      </Text>
    </View>
  );
}

export function SyncStatusBanner() {
  // PowerSync only runs on native now — there's no sync connection on web to
  // report status for, and its context there is an inert placeholder.
  if (Platform.OS === "web") return null;

  return <NativeSyncStatusBanner />;
}
