import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

export function useKeyboardHeight(enabled = true): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setHeight(0);
      return;
    }

    function onShow(event: KeyboardEvent) {
      setHeight(event.endCoordinates.height);
    }

    function onHide() {
      setHeight(0);
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [enabled]);

  return height;
}
