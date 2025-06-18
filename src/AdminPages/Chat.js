import React, { useEffect, useState, useRef } from "react";
import {
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import SidebarAdmin from "./SidebarAdmin";
import "../AdminStyles/Chat.css";

const getToken = () => {
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));
  return user?.token;
};

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchChats = async () => {
    setLoadingChats(true);
    setError(null);
    const token = getToken();

    if (!token) {
      setError("User not authenticated");
      setLoadingChats(false);
      return;
    }

    try {
      const response = await fetch("http://shippinganddelivery.runasp.net/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !activeChatId) setActiveChatId(data[0].id);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoadingChats(false);
    }
  };

  const deleteChat = async (chatId) => {
    const token = getToken();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      const response = await fetch(
        `http://shippinganddelivery.runasp.net/api/chats/${chatId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete chat");
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (chatId === activeChatId) {
        setActiveChatId(null);
        setActiveChatMessages([]);
      }
    } catch (err) {
      alert("Error deleting chat: " + err.message);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token || !activeChatId) return;

    const connection = new HubConnectionBuilder()
      .withUrl("http://shippinganddelivery.runasp.net/hubs/chat", {
        accessTokenFactory: () => getToken(),
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => setError(null))
      .catch((e) => setError("Failed to connect: " + e.message));

    connection.on("ReceiveMessage", (msg) => {
      setActiveChatMessages((prev) => {
        if (msg.chatId !== activeChatId) return prev;
        return [...prev, msg];
      });
      fetchChats();
    });

    connection.on("ChatsUpdated", fetchChats);
    connectionRef.current = connection;

    return () => {
      connection.off("ReceiveMessage");
      connection.off("ChatsUpdated");
      connection.stop();
    };
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      setActiveChatMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      const token = getToken();
      try {
        const res = await fetch(
          `http://shippinganddelivery.runasp.net/api/chats/${activeChatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setActiveChatMessages(data.messages || []);
      } catch (err) {
        setError("Failed to load messages: " + err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatMessages]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const sendMessage = async () => {
    if (!message.trim() || !connectionRef.current) return;
    try {
      await connectionRef.current.invoke("SendMessage", activeChatId, message.trim());
      setMessage("");
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const filteredChats = chats.filter((chat) =>
    (chat.recipientName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-wrapper">
      <SidebarAdmin />
      <div className="chat-page">
        <div className="chat-sidebar">
          <h2>Chats</h2>
          <input
            className="search-input"
            type="text"
            placeholder="Search by recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loadingChats ? (
            <p>Loading chats...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <ul className="chat-list">
              {filteredChats.map((chat) => (
                <li
                  key={chat.id}
                  className={chat.id === activeChatId ? "active" : ""}
                >
                  <div onClick={() => setActiveChatId(chat.id)}>
                    <strong>{chat.recipientName || "Unknown"}</strong>
                    <p>
                      Last:{" "}
                      {chat.lastMessageAtUtc
                        ? new Date(chat.lastMessageAtUtc).toLocaleString()
                        : "No messages"}
                    </p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteChat(chat.id)}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chat-content">
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : (
            <>
              <div className="chat-header">
                <h3>
                  Chat with:{" "}
                  {
                    chats.find((c) => c.id === activeChatId)?.recipientName ||
                    "Unknown"
                  }
                </h3>
              </div>

              <div className="chat-messages">
                {activeChatMessages.length === 0 ? (
                  <p>No messages in this chat.</p>
                ) : (
                  activeChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`chat-bubble ${
                        msg.senderName === "Admin" ? "sent" : "received"
                      }`}
                    >
                      <p>
                        <strong>{msg.senderName}:</strong> {msg.content}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="send-btn" onClick={sendMessage}>
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
