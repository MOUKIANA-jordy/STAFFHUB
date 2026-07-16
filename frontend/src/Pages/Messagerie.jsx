import React, { useState } from "react";
import { Search, Send, UserRound } from "lucide-react";

import "../Styles/messagerie.css";

const conversations = [
  {
    id: 1,
    name: "Marie Martin",
    message: "Bonjour, avez-vous reçu le document ?",
    time: "10:45",
  },
  {
    id: 2,
    name: "Service RH",
    message: "Votre demande de congé a été traitée.",
    time: "Hier",
  },
  {
    id: 3,
    name: "Paul Bernard",
    message: "La réunion est prévue à 14h.",
    time: "Lun.",
  },
];

const initialMessages = {
  1: [
    {
      id: 1,
      author: "Marie Martin",
      text: "Bonjour, avez-vous reçu le document ?",
      mine: false,
    },
    {
      id: 2,
      author: "Moi",
      text: "Bonjour, oui je viens de le recevoir.",
      mine: true,
    },
  ],
  2: [
    {
      id: 1,
      author: "Service RH",
      text: "Votre demande de congé a été traitée.",
      mine: false,
    },
  ],
  3: [
    {
      id: 1,
      author: "Paul Bernard",
      text: "La réunion est prévue à 14h.",
      mine: false,
    },
  ],
};

export default function Messagerie() {
  const [selectedConversationId, setSelectedConversationId] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((currentMessages) => ({
      ...currentMessages,
      [selectedConversationId]: [
        ...(currentMessages[selectedConversationId] || []),
        {
          id: Date.now(),
          author: "Moi",
          text: trimmedMessage,
          mine: true,
        },
      ],
    }));

    setNewMessage("");
  };

  return (
    <section className="messaging-page">
      <aside className="conversations-panel">
        <h1>Messagerie</h1>

        <div className="conversation-search">
          <Search size={18} />
          <input type="search" placeholder="Rechercher une conversation..." />
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={`conversation-item ${
                selectedConversationId === conversation.id
                  ? "conversation-active"
                  : ""
              }`}
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              <span className="conversation-avatar">
                {conversation.name.charAt(0)}
              </span>

              <span className="conversation-details">
                <span className="conversation-name-row">
                  <strong>{conversation.name}</strong>
                  <small>{conversation.time}</small>
                </span>

                <span className="conversation-preview">
                  {conversation.message}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="chat-panel">
        <header className="chat-header">
          <span className="chat-avatar">
            <UserRound size={23} />
          </span>

          <div>
            <strong>{selectedConversation?.name}</strong>
            <span>En ligne</span>
          </div>
        </header>

        <div className="chat-messages">
          {(messages[selectedConversationId] || []).map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.mine ? "chat-message-mine" : ""
              }`}
            >
              <span>{message.text}</span>
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Écrivez votre message..."
          />

          <button type="submit" aria-label="Envoyer le message">
            <Send size={20} />
          </button>
        </form>
      </div>
    </section>
  );
}
