import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const Inbox = () => {
  const { user } = useUserContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get("/chat/conversations");
        setConversations(data);
        const convId = searchParams.get("conversation");
        if (convId) {
          const conv = data.find((c) => c._id === convId);
          if (conv) {
            setCurrentConversation(conv);
            searchParams.delete("conversation");
            setSearchParams(searchParams);
          }
        } else if (data.length > 0 && !currentConversation) {
          setCurrentConversation(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      }
    };
    fetchConversations();
  }, [searchParams, setSearchParams, currentConversation]);

  // Carregar mensagens da conversa selecionada
  useEffect(() => {
    if (!currentConversation) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `/chat/conversations/${currentConversation._id}/messages`,
        );
        setMessages(data);
        // Após carregar as mensagens, actualizar a lista de conversas para zerar o contador de não lidas desta conversa
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === currentConversation._id
              ? { ...conv, unreadCount: 0 }
              : conv,
          ),
        );
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    };
    fetchMessages();
  }, [currentConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/chat/conversations/${currentConversation._id}/messages`,
        { text: newMessage },
      );
      setMessages([...messages, data]);
      setNewMessage("");
      // Actualizar a lista de conversas (última mensagem e timestamp)
      const updatedConversations = conversations.map((conv) =>
        conv._id === currentConversation._id
          ? { ...conv, updatedAt: new Date().toISOString() }
          : conv,
      );
      setConversations(updatedConversations);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] w-full max-w-7xl gap-4">
      {/* Lista de conversas (sidebar) */}
      <div className="w-1/3 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-3 font-semibold">
          Mensagens
        </div>
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100% - 52px)" }}
        >
          {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Nenhuma conversa ainda.
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => setCurrentConversation(conv)}
              className={`cursor-pointer border-b border-gray-100 p-3 transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                currentConversation?._id === conv._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-white">
                  {conv.otherUser?.name || "Utilizador"}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary-400 rounded-full px-2 py-0.5 text-xs font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {conv.place?.title || "Conversa geral"}
              </div>
              <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área da conversa*/}
      <div className="w-2/3 rounded-xl border border-gray-200 bg-white shadow-sm">
        {!currentConversation ? (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            Selecione uma conversa
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {currentConversation.otherUser?.name || "Utilizador"}
              </h3>
              <p className="text-sm text-gray-500">
                {currentConversation.place?.title || "Conversa geral"}
              </p>
            </div>

            <div className="flex h-[calc(100%-130px)] flex-col overflow-y-auto p-4">
              {messages.map((msg) => {
                if (msg.isSystem || !msg.sender) {
                  return (
                    <div
                      key={msg._id}
                      className="my-2 text-center text-sm text-gray-500 italic dark:text-gray-400"
                    >
                      {msg.text}
                    </div>
                  );
                }
                const isCurrentUser = msg.sender._id === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`mb-3 flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? "bg-primary-400 text-white"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="mt-1 text-right text-xs opacity-70">
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-100 px-4 py-2 text-gray-600">
                    A enviar...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escreva a sua mensagem..."
                  className="focus:ring-primary-400 flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus:ring-2 focus:outline-none dark:text-white"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="bg-primary-400 hover:bg-primary-500 rounded-full px-4 py-2 text-white transition disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inbox;
