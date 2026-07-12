export type AlertButtonStyle = "default" | "cancel" | "destructive";

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

export type AlertState = {
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type Listener = (state: AlertState | null) => void;

let listener: Listener | null = null;

export function subscribeAlert(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const resolvedButtons = buttons && buttons.length > 0 ? buttons : [{ text: "OK" }];
  listener?.({ title, message, buttons: resolvedButtons });
}

export function dismissAlert() {
  listener?.(null);
}
