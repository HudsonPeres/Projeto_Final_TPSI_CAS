import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { useUserContext } from "../contexts/UserContext";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import mariaIcon from "../assets/MarIA.png";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useUserContext();
  const location = useLocation();

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) console.warn("Chave API do Gemini não configurada no .env");
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI
    ? genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.85,
        },
      })
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getContextPrompt = () => {
    const path = location.pathname;
    if (path === "/") {
      return "O que posso sugerir sobre experiências rurais?";
    }
    if (path.startsWith("/account/places/new")) {
      return "Estou a criar um anúncio. Podes ajudar‑me a escrever uma descrição atrativa para uma experiência rural?";
    }
    if (path.startsWith("/place/")) {
      return "Estou a ver um anúncio. Podes dar dicas sobre a região?";
    }
    if (
      user?.role === "admin" ||
      user?.role === "superadmin" ||
      user?.role === "support"
    ) {
      return "Sou administrador/suporte. Sugere boas práticas de gestão de anúncios e reservas.";
    }
    return "Olá! Sou a MarIA, tua assistente de turismo rural. Como posso ajudar?";
  };

  const extractKeywords = (text) => {
    const stopWords = [
      "olá",
      "oi",
      "maria",
      "assistente",
      "por favor",
      "pfvr",
      "quero",
      "gostaria",
      "preciso",
      "sugere",
      "recomenda",
      "indica",
      "experiência",
      "experiencias",
      "anúncio",
      "anuncios",
      "lugar",
      "lugares",
      "bom",
      "boa",
      "noite",
      "dia",
      "tarde",
      "manhã",
      "como",
      "estás",
      "está",
    ];
    let cleaned = text.toLowerCase();
    stopWords.forEach((word) => {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
    });
    const words = cleaned
      .replace(/[^\w\sáéíóúâêôçã]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    if (words.length === 0) return "";
    return words[words.length - 1];
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!model) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Assistente indisponível: chave API em falta.",
        },
      ]);
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let searchQuery = extractKeywords(input);
      let searchResults = [];
      if (searchQuery.length > 2) {
        try {
          const res = await axios.get(
            `/places/search?q=${encodeURIComponent(searchQuery)}`,
          );
          searchResults = res.data;
        } catch (err) {
          console.warn("Erro na busca de lugares:", err);
        }
      }

      const context = getContextPrompt();
      const userName = user?.name || "visitante";
      let resultsText = "";
      if (searchResults.length > 0) {
        resultsText = "\n\n**Anúncios encontrados:**\n";
        searchResults.forEach((place, idx) => {
          const link = `/place/${place._id}`;
          resultsText += `${idx + 1}. [${place.title}](${link}) – ${place.price}€ – ${place.address}\n`;
        });
      } else if (searchQuery.length > 2) {
        resultsText = "\n\nNão encontrei anúncios relacionados à sua procura.";
      }

      const fullPrompt = `Contexto: ${context}
Utilizador: ${userName}
Dados da pesquisa: ${resultsText}

Instrução: 
- Sê uma assistente cordial, simpática e natural. Chama o utilizador pelo nome (${userName}).
- Se foram encontrados anúncios, lista‑os de forma amigável e oferece ajuda com mais detalhes.
- Responde de forma breve (máximo 3 frases).
- **NUNCA** (absolutamente nunca) incluas links externos (ex: Google Maps, Wikipedia, sites de terceiros). Apenas usa os links que estão nos dados da pesquisa (todos começam com /place/).
- Quando listares anúncios, apresenta o título como um link clicável usando exactamente o URL fornecido (ex: [Título](link)).
- Se o utilizador pedir mais detalhes sobre um anúncio, pergunta se quer que mostre a página.

Utilizador: ${input}
MarIA:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let botMsgContent = response.text();

      if (botMsgContent.length > 350) {
        botMsgContent = botMsgContent.substring(0, 350) + "...";
      }
      setMessages((prev) => [...prev, { role: "bot", content: botMsgContent }]);
    } catch (error) {
      console.error("Erro Gemini:", error);
      let errorMessage =
        "Desculpa, estou com problemas técnicos. Tenta novamente.";
      if (error.message?.includes("429")) {
        errorMessage =
          "Limite de uso da IA atingido. Tente novamente dentro de alguns minutos.";
      }
      setMessages((prev) => [...prev, { role: "bot", content: errorMessage }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-secondary-400 fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105 focus:outline-none"
      >
        <img src={mariaIcon} alt="MarIA" className="h-10 w-10 rounded-full" />
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 z-50 flex h-[500px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-secondary-400 flex items-center justify-between rounded-t-2xl px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <img
                src={mariaIcon}
                alt="MarIA"
                className="h-8 w-8 rounded-full"
              />
              <span className="font-semibold">MarIA – Assistente Virtual</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl font-bold hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                <p>Olá! Sou a MarIA.</p>
                <p className="text-sm">Em que posso ajudar?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-secondary-400 text-white"
                      : "bg-accent-400 text-white"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-2 text-gray-600">
                  A pensar...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escreve a tua mensagem..."
                className="focus:ring-secondary-400 flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-secondary-400 hover:bg-secondary-500 rounded-full px-4 py-2 text-white transition disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
