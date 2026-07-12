import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";

import { subscribeAlert, dismissAlert, type AlertState } from "@/lib/alertStore";

/**
 * Renders alerts triggered via `lib/alert`'s `Alert.alert`. Mounted once at
 * the app root. react-native-web's own `Alert.alert` is a no-op, so this is
 * what actually shows something on web; native platforms use the real
 * `Alert.alert` and never touch this component.
 */
export function AlertHost() {
  const [state, setState] = useState<AlertState | null>(null);

  useEffect(() => subscribeAlert(setState), []);

  if (!state) return null;

  const handlePress = (button: AlertState["buttons"][number]) => {
    dismissAlert();
    button.onPress?.();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismissAlert}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-8"
        onPress={dismissAlert}>
        <Pressable className="w-full max-w-sm rounded-3xl bg-surface p-5" onPress={() => {}}>
          <Text className="font-urbanist-bold text-base text-ink">{state.title}</Text>
          {state.message ? (
            <Text className="mt-2 font-urbanist text-sm text-muted">{state.message}</Text>
          ) : null}

          <View className="mt-5 gap-2">
            {state.buttons.map((button, index) => {
              const isCancel = button.style === "cancel";
              const isDestructive = button.style === "destructive";
              return (
                <Pressable
                  key={`${button.text ?? "OK"}-${index}`}
                  onPress={() => handlePress(button)}
                  className={`items-center rounded-full py-3 active:opacity-70 ${
                    isCancel ? "bg-neutral" : "border border-line"
                  }`}>
                  <Text
                    className={`font-urbanist-semibold text-sm ${
                      isDestructive ? "text-primary" : isCancel ? "text-muted" : "text-ink"
                    }`}>
                    {button.text ?? "OK"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
