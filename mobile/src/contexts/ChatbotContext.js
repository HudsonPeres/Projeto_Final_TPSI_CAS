import React, { createContext, useState, useContext, useRef } from "react";
import { Dimensions } from "react-native";

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Olá! 👋 Sou a MarIA, a sua assistente virtual. Em que posso ajudar?",
    },
  ]);
  const [visible, setVisible] = useState(false);

  const showChatbot = () => setVisible(true);
  const hideChatbot = () => setVisible(false);

  return (
    <ChatbotContext.Provider
      value={{ messages, setMessages, visible, showChatbot, hideChatbot }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
