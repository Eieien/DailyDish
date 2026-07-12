import { Alert as NativeAlert, Platform } from "react-native";

import { showAlert, type AlertButton } from "./alertStore";

function alert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== "web") {
    NativeAlert.alert(title, message, buttons);
    return;
  }
  showAlert(title, message, buttons);
}

export const Alert = { alert };
