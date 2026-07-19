import { Platform, View, Text } from "react-native";
import { useStatus } from "@powersync/react";

function NativeSyncStatusBanner() {
  const status = useStatus();
  const pending = status?.dataFlowStatus?.uploading ?? false;

  if (status?.connected && !pending) return null;

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
