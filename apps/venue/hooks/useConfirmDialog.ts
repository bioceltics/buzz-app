import { Alert, Platform } from 'react-native';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Cross-platform confirmation dialog hook
 * Uses window.confirm on web and Alert.alert on native
 */
export function useConfirmDialog() {
  const showConfirmDialog = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
  }: ConfirmDialogOptions) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        Promise.resolve(onConfirm()).catch((error) => {
          console.error('Confirm dialog error:', error);
        });
      } else {
        onCancel?.();
      }
    } else {
      Alert.alert(title, message, [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: () => {
            Promise.resolve(onConfirm()).catch((error) => {
              console.error('Confirm dialog error:', error);
            });
          },
        },
      ]);
    }
  };

  const showDeleteDialog = (itemName: string, onConfirm: () => void) => {
    showConfirmDialog({
      title: 'Delete',
      message: `Are you sure you want to delete "${itemName}"? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm,
    });
  };

  const showDeactivateDialog = (itemName: string, onConfirm: () => void) => {
    showConfirmDialog({
      title: 'Deactivate',
      message: `Are you sure you want to deactivate "${itemName}"?`,
      confirmText: 'Deactivate',
      destructive: false,
      onConfirm,
    });
  };

  return {
    showConfirmDialog,
    showDeleteDialog,
    showDeactivateDialog,
  };
}

export default useConfirmDialog;
