import React from "react";
import { TouchableWithoutFeedback, Keyboard } from "react-native";

export default function DismissKeyboardView({ children }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
}
