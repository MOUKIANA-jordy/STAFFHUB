import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  Search,
  Send,
  UserRound,
  Paperclip,
  Plus,
  X,
  Users,
  MessageCircle,
  FileText,
  Loader2,
  Inbox,
  MessagesSquare,
  Archive,
  SlidersHorizontal,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/messagerie.css";


export default function Messagerie() {

  // =========================================================
  // URL
  // Permet d'ouvrir directement :
  // /home/messagerie?conversation=5
  // =========================================================

  const [searchParams] = useSearchParams();

  const conversationFromUrl = (
    searchParams.get("conversation")
  );


  // =========================================================
  // STATES
  // =========================================================

  const [currentUser, setCurrentUser] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState(null);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [search, setSearch] = useState("");

  const [activeFolder, setActiveFolder] = useState("TOUTES");

  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [showNewConversation, setShowNewConversation] =
    useState(false);

  const [salaries, setSalaries] = useState([]);

  const [loadingSalaries, setLoadingSalaries] =
    useState(false);

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [conversationForm, setConversationForm] = useState({
    sujet: "",
    type_conversation: "PRIVE",
    participants_ids: [],
  });


  // =========================================================
  // REFS
  // =========================================================

  const messagesEndRef = useRef(null);

  const fileInputRef = useRef(null);


  // =========================================================
  // HELPER DRF PAGINATION
  // =========================================================

  const extractResults = (data) => {

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data
      && Array.isArray(data.results)
    ) {
      return data.results;
    }

    return [];

  };


  // =========================================================
  // FORMAT DATE / HEURE
  // =========================================================

  const formatMessageTime = (value) => {

    if (!value) {
      return "";
    }

    const date = new Date(value);

    return date.toLocaleTimeString(
      "fr-FR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  const formatConversationTime = (value) => {

    if (!value) {
      return "";
    }

    const date = new Date(value);

    const today = new Date();

    const sameDay = (
      date.toDateString()
      === today.toDateString()
    );

    if (sameDay) {

      return date.toLocaleTimeString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    }

    return date.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );

  };


  // =========================================================
  // CHARGEMENT UTILISATEUR
  // =========================================================

  useEffect(() => {

    const fetchCurrentUser = async () => {

      try {

        const response = await API.get(
          "/api/me/"
        );

        setCurrentUser(
          response.data
        );

      } catch (err) {

        console.error(
          "ME ERROR",
          err
        );

      }

    };

    fetchCurrentUser();

  }, []);


  // =========================================================
  // CHARGEMENT CONVERSATIONS
  // =========================================================

  const fetchConversations = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get(
        "/api/conversations/"
      );

      const data = extractResults(
        response.data
      );

      setConversations(data);


      // -----------------------------------------------------
      // Conversation depuis URL
      // -----------------------------------------------------

      if (
        conversationFromUrl
        && data.some(
          (conversation) =>
            String(conversation.id)
            === String(conversationFromUrl)
        )
      ) {

        setSelectedConversationId(
          Number(conversationFromUrl)
        );

      }

      // -----------------------------------------------------
      // Sinon première conversation
      // -----------------------------------------------------

      else if (
        !selectedConversationId
        && data.length > 0
      ) {

        setSelectedConversationId(
          data[0].id
        );

      }

    } catch (err) {

      console.error(
        "CONVERSATIONS ERROR",
        err
      );

      setError(
        err.response?.data?.detail
        || "Impossible de charger les conversations."
      );

      setConversations([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchConversations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =========================================================
  // CHARGEMENT DÉTAIL CONVERSATION
  // =========================================================

  useEffect(() => {

    if (!selectedConversationId) {

      setSelectedConversation(null);
      setMessages([]);

      return;

    }


    const fetchConversation = async () => {

      try {

        setLoadingMessages(true);
        setError("");

        const response = await API.get(
          `/api/conversations/${selectedConversationId}/`
        );

        const data = response.data;

        setSelectedConversation(data);

        setMessages(
          Array.isArray(data.messages)
            ? data.messages
            : []
        );


        // ---------------------------------------------------
        // Marquer comme lue
        // ---------------------------------------------------

        try {

          await API.post(
            `/api/conversations/${selectedConversationId}/marquer-lue/`
          );

        } catch (readError) {

          console.warn(
            "MARK READ ERROR",
            readError
          );

        }

      } catch (err) {

        console.error(
          "CONVERSATION DETAIL ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger cette conversation."
        );

        setSelectedConversation(null);
        setMessages([]);

      } finally {

        setLoadingMessages(false);

      }

    };


    fetchConversation();

  }, [selectedConversationId]);


  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  // =========================================================
  // NOM DE LA CONVERSATION
  // =========================================================

  const getConversationName = (conversation) => {

    if (!conversation) {
      return "Conversation";
    }

    if (conversation.sujet) {
      return conversation.sujet;
    }

    if (conversation.cree_par_nom) {
      return conversation.cree_par_nom;
    }

    return `Conversation #${conversation.id}`;

  };


  // =========================================================
  // PARTICIPANTS AFFICHÉS
  // =========================================================

  const participantNames = useMemo(() => {

    if (
      !selectedConversation
      || !Array.isArray(
        selectedConversation.participants
      )
    ) {
      return "";
    }

    return selectedConversation.participants
      .filter(
        (participant) =>
          participant.salarie
          !== currentUser?.id
      )
      .map(
        (participant) =>
          participant.salarie_nom
      )
      .join(", ");

  }, [
    selectedConversation,
    currentUser,
  ]);


  // =========================================================
  // FILTRE CONVERSATIONS
  // =========================================================

  const filteredConversations = useMemo(() => {

    const normalizedSearch = (
      search
      .trim()
      .toLowerCase()
    );

    return conversations.filter(
      (conversation) => {

        const matchesFolder = (
          activeFolder === "TOUTES"
          || (
            activeFolder === "PRIVEES"
            && conversation.type_conversation === "PRIVE"
            && conversation.active
          )
          || (
            activeFolder === "GROUPES"
            && conversation.type_conversation === "GROUPE"
            && conversation.active
          )
          || (
            activeFolder === "ARCHIVEES"
            && !conversation.active
          )
        );

        if (!matchesFolder) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const name = (
          getConversationName(
            conversation
          )
          .toLowerCase()
        );

        const preview = (
          conversation
            .dernier_message
            ?.contenu
          || ""
        ).toLowerCase();

        return (
          name.includes(
            normalizedSearch
          )
          || preview.includes(
            normalizedSearch
          )
        );

      }
    );

  }, [conversations, search, activeFolder]);


  // =========================================================
  // ENVOI MESSAGE
  // =========================================================

  const sendMessage = async (event) => {

    event.preventDefault();

    const trimmedMessage = (
      newMessage.trim()
    );


    if (
      !selectedConversationId
    ) {
      return;
    }


    if (
      !trimmedMessage
      && !selectedFile
    ) {

      return;

    }


    // Le backend exige actuellement
    // un contenu non vide pour Message.
    if (!trimmedMessage) {

      setError(
        "Ajoutez un message avec la pièce jointe."
      );

      return;

    }


    try {

      setSending(true);
      setError("");


      // -----------------------------------------------------
      // CRÉATION DU MESSAGE
      // -----------------------------------------------------

      const messageResponse = await API.post(
        "/api/messages/",
        {
          conversation:
            selectedConversationId,

          contenu:
            trimmedMessage,
        }
      );


      const createdMessage = (
        messageResponse.data
      );


      // -----------------------------------------------------
      // PIÈCE JOINTE
      // -----------------------------------------------------

      if (
        selectedFile
        && createdMessage?.id
      ) {

        const formData = new FormData();

        formData.append(
          "message",
          createdMessage.id
        );

        formData.append(
          "fichier",
          selectedFile
        );


        await API.post(
          "/api/pieces-jointes/",
          formData
        );

      }


      setNewMessage("");

      setSelectedFile(null);


      if (fileInputRef.current) {

        fileInputRef.current.value = "";

      }


      // -----------------------------------------------------
      // RECHARGER LES MESSAGES
      // pour récupérer aussi les pièces jointes.
      // -----------------------------------------------------

      const messagesResponse = await API.get(
        `/api/conversations/${selectedConversationId}/messages/`
      );


      setMessages(
        extractResults(
          messagesResponse.data
        )
      );


      // -----------------------------------------------------
      // Actualiser la colonne gauche
      // -----------------------------------------------------

      const conversationsResponse = await API.get(
        "/api/conversations/"
      );


      setConversations(
        extractResults(
          conversationsResponse.data
        )
      );

    } catch (err) {

      console.error(
        "SEND MESSAGE ERROR",
        err
      );


      const data = (
        err.response?.data
      );


      if (
        data?.contenu
        && Array.isArray(
          data.contenu
        )
      ) {

        setError(
          data.contenu[0]
        );

      } else if (
        data?.conversation
        && Array.isArray(
          data.conversation
        )
      ) {

        setError(
          data.conversation[0]
        );

      } else {

        setError(
          data?.detail
          || "Impossible d'envoyer le message."
        );

      }

    } finally {

      setSending(false);

    }

  };


  // =========================================================
  // CHOIX FICHIER
  // =========================================================

  const handleFileChange = (event) => {

    const file = (
      event.target.files?.[0]
    );

    if (!file) {
      return;
    }


    const maxSize = (
      10
      * 1024
      * 1024
    );


    if (file.size > maxSize) {

      setError(
        "La pièce jointe ne doit pas dépasser 10 Mo."
      );

      event.target.value = "";

      return;

    }


    setError("");

    setSelectedFile(file);

  };


  // =========================================================
  // NOUVELLE CONVERSATION
  // =========================================================

  const openNewConversation = async () => {

    setShowNewConversation(true);

    setError("");

    setLoadingSalaries(true);


    try {

      const response = await API.get(
        "/api/salaries/"
      );

      const data = extractResults(
        response.data
      );


      setSalaries(
        data.filter(
          (salarie) =>
            salarie.id
            !== currentUser?.id
        )
      );

    } catch (err) {

      console.error(
        "SALARIES ERROR",
        err
      );

      setSalaries([]);

    } finally {

      setLoadingSalaries(false);

    }

  };


  // =========================================================
  // PARTICIPANT CHECKBOX
  // =========================================================

  const toggleParticipant = (
    salarieId
  ) => {

    setConversationForm(
      (previous) => {

        const exists = (
          previous
            .participants_ids
            .includes(
              salarieId
            )
        );


        // ---------------------------------------------------
        // Conversation privée :
        // un seul autre participant.
        // ---------------------------------------------------

        if (
          previous.type_conversation
          === "PRIVE"
        ) {

          return {
            ...previous,
            participants_ids:
              exists
                ? []
                : [salarieId],
          };

        }


        // ---------------------------------------------------
        // Groupe :
        // plusieurs participants.
        // ---------------------------------------------------

        return {
          ...previous,

          participants_ids:
            exists
              ? previous
                  .participants_ids
                  .filter(
                    (id) =>
                      id !== salarieId
                  )
              : [
                  ...previous.participants_ids,
                  salarieId,
                ],
        };

      }
    );

  };


  // =========================================================
  // CHANGEMENT TYPE CONVERSATION
  // =========================================================

  const handleConversationTypeChange = (
    event
  ) => {

    const value = (
      event.target.value
    );


    setConversationForm(
      (previous) => ({
        ...previous,

        type_conversation:
          value,

        participants_ids: [],
      })
    );

  };


  // =========================================================
  // CRÉER CONVERSATION
  // =========================================================

  const createConversation = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const {
      sujet,
      type_conversation,
      participants_ids,
    } = conversationForm;


    if (
      type_conversation === "PRIVE"
      && participants_ids.length !== 1
    ) {

      setError(
        "Sélectionnez une personne pour une conversation privée."
      );

      return;

    }


    if (
      type_conversation === "GROUPE"
      && participants_ids.length < 2
    ) {

      setError(
        "Sélectionnez au moins deux autres participants pour un groupe."
      );

      return;

    }


    try {

      setCreatingConversation(true);


      const response = await API.post(
        "/api/conversations/",
        {
          sujet:
            sujet.trim(),

          type_conversation,

          participants_ids,
        }
      );


      const created = (
        response.data
      );


      setShowNewConversation(false);


      setConversationForm({
        sujet: "",
        type_conversation: "PRIVE",
        participants_ids: [],
      });


      await fetchConversations();


      if (created?.id) {

        setSelectedConversationId(
          created.id
        );

      }

    } catch (err) {

      console.error(
        "CREATE CONVERSATION ERROR",
        err
      );


      const data = (
        err.response?.data
      );


      if (
        data?.participants_ids
      ) {

        const participantError = (
          Array.isArray(
            data.participants_ids
          )
            ? data.participants_ids[0]
            : data.participants_ids
        );

        setError(
          participantError
        );

      } else {

        setError(
          data?.detail
          || "Impossible de créer la conversation."
        );

      }

    } finally {

      setCreatingConversation(false);

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  const privateCount = conversations.filter(
    (conversation) => (
      conversation.type_conversation === "PRIVE"
      && conversation.active
    )
  ).length;

  const groupCount = conversations.filter(
    (conversation) => (
      conversation.type_conversation === "GROUPE"
      && conversation.active
    )
  ).length;

  const archivedCount = conversations.filter(
    (conversation) => !conversation.active
  ).length;


  return (
    <main className="messaging-workspace">

      <header className="messaging-page-heading">
        <div>
          <span className="messaging-eyebrow">
            Espace collaboratif
          </span>

          <h1>Boîte de réception</h1>

          <p>
            Échangez avec les salariés et les équipes RH.
          </p>
        </div>

        <button
          type="button"
          className="messaging-compose-button"
          onClick={openNewConversation}
        >
          <Plus size={18} />
          Nouveau message
        </button>
      </header>

      <section className="messaging-page">

        <nav
          className="mailbox-navigation"
          aria-label="Dossiers de messagerie"
        >
          <div className="mailbox-navigation-title">
            <MessagesSquare size={20} />
            <strong>Messagerie</strong>
          </div>

          <button
            type="button"
            className={activeFolder === "TOUTES" ? "is-active" : ""}
            onClick={() => setActiveFolder("TOUTES")}
          >
            <Inbox size={18} />
            <span>Réception</span>
            <small>{conversations.length}</small>
          </button>

          <button
            type="button"
            className={activeFolder === "PRIVEES" ? "is-active" : ""}
            onClick={() => setActiveFolder("PRIVEES")}
          >
            <UserRound size={18} />
            <span>Messages privés</span>
            <small>{privateCount}</small>
          </button>

          <button
            type="button"
            className={activeFolder === "GROUPES" ? "is-active" : ""}
            onClick={() => setActiveFolder("GROUPES")}
          >
            <Users size={18} />
            <span>Groupes</span>
            <small>{groupCount}</small>
          </button>

          <button
            type="button"
            className={activeFolder === "ARCHIVEES" ? "is-active" : ""}
            onClick={() => setActiveFolder("ARCHIVEES")}
          >
            <Archive size={18} />
            <span>Archivées</span>
            <small>{archivedCount}</small>
          </button>

          <div className="mailbox-navigation-note">
            <SlidersHorizontal size={17} />
            <p>
              Les conversations sont synchronisées avec votre compte StaffHub.
            </p>
          </div>
        </nav>


      {/* ===================================================
          COLONNE CONVERSATIONS
      =================================================== */}

      <aside className="conversations-panel">


        {/* TITRE */}

        <div className="messaging-title-row">

          <div>

            <h1>
              Messagerie
            </h1>

            <span>
              {conversations.length} conversation
              {conversations.length > 1 ? "s" : ""}
            </span>

          </div>


          <span className="conversation-list-status">
            {filteredConversations.length}
          </span>

        </div>


        {/* RECHERCHE */}

        <div className="conversation-search">

          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value
                )
            }
            placeholder="Rechercher..."
          />

        </div>


        {/* LISTE */}

        <div className="conversation-list">

          {loading ? (

            <div className="messaging-state">

              <Loader2
                size={22}
                className="spin"
              />

              <span>
                Chargement...
              </span>

            </div>

          ) : filteredConversations.length > 0 ? (

            filteredConversations.map(
              (conversation) => {

                const lastMessage = (
                  conversation
                    .dernier_message
                );


                return (

                  <button
                    key={conversation.id}
                    type="button"
                    className={
                      `conversation-item ${
                        selectedConversationId
                        === conversation.id
                          ? "conversation-active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setSelectedConversationId(
                        conversation.id
                      )
                    }
                  >

                    <span className="conversation-avatar">

                      {(
                        getConversationName(
                          conversation
                        )
                        .charAt(0)
                        .toUpperCase()
                      )}

                    </span>


                    <span className="conversation-details">


                      <span className="conversation-name-row">

                        <strong>

                          {getConversationName(
                            conversation
                          )}

                        </strong>


                        <small>

                          {formatConversationTime(
                            lastMessage?.created_at
                            || conversation.updated_at
                          )}

                        </small>

                      </span>


                      <span className="conversation-preview">

                        {lastMessage?.contenu
                          || "Aucun message"
                        }

                      </span>


                    </span>

                  </button>

                );

              }
            )

          ) : (

            <div className="messaging-state">

              <MessageCircle size={26} />

              <span>
                Aucune conversation.
              </span>

            </div>

          )}

        </div>


      </aside>


      {/* ===================================================
          CHAT
      =================================================== */}

      <div className="chat-panel">


        {selectedConversationId ? (

          <>


            {/* ===============================================
                HEADER CHAT
            =============================================== */}

            <header className="chat-header">


              <span className="chat-avatar">

                {selectedConversation
                  ?.type_conversation
                  === "GROUPE"
                  ? (
                    <Users size={23} />
                  )
                  : (
                    <UserRound size={23} />
                  )
                }

              </span>


              <div className="chat-header-info">

                <strong>

                  {selectedConversation
                    ? getConversationName(
                        selectedConversation
                      )
                    : "Conversation"
                  }

                </strong>


                <span>

                  {participantNames
                    || (
                      selectedConversation
                        ?.type_conversation
                      === "GROUPE"
                        ? "Conversation de groupe"
                        : "Conversation privée"
                    )
                  }

                </span>

              </div>


            </header>


            {/* ===============================================
                MESSAGES
            =============================================== */}

            <div className="chat-messages">


              {loadingMessages ? (

                <div className="messaging-state">

                  <Loader2
                    size={22}
                    className="spin"
                  />

                  <span>
                    Chargement des messages...
                  </span>

                </div>

              ) : messages.length > 0 ? (

                messages.map(
                  (message) => {

                    const mine = (
                      message.auteur
                      === currentUser?.id
                    );


                    return (

                      <div
                        key={message.id}
                        className={
                          `chat-message-wrapper ${
                            mine
                              ? "chat-message-wrapper-mine"
                              : ""
                          }`
                        }
                      >


                        {!mine && (

                          <span className="message-author">

                            {message.auteur_nom}

                          </span>

                        )}


                        <div
                          className={
                            `chat-message ${
                              mine
                                ? "chat-message-mine"
                                : ""
                            }`
                          }
                        >

                          <span>
                            {message.contenu}
                          </span>


                          {/* PIÈCES JOINTES */}

                          {Array.isArray(
                            message.pieces_jointes
                          )
                          && message
                              .pieces_jointes
                              .length > 0
                          && (

                            <div className="message-attachments">

                              {message
                                .pieces_jointes
                                .map(
                                  (piece) => (

                                    <a
                                      key={piece.id}
                                      href={piece.fichier}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="message-attachment"
                                    >

                                      <FileText size={15} />

                                      <span>
                                        {
                                          piece.nom_fichier
                                          || "Fichier"
                                        }
                                      </span>

                                    </a>

                                  )
                                )
                              }

                            </div>

                          )}


                          <small className="message-time">

                            {message.is_edited
                              ? "Modifié • "
                              : ""
                            }

                            {formatMessageTime(
                              message.created_at
                            )}

                          </small>


                        </div>

                      </div>

                    );

                  }
                )

              ) : (

                <div className="messaging-empty-chat">

                  <MessageCircle size={42} />

                  <strong>
                    Aucun message
                  </strong>

                  <span>
                    Envoyez le premier message de cette conversation.
                  </span>

                </div>

              )}


              <div ref={messagesEndRef} />


            </div>


            {/* ===============================================
                ERREUR
            =============================================== */}

            {error && (

              <div className="messaging-error">

                {error}

              </div>

            )}


            {/* ===============================================
                FICHIER SÉLECTIONNÉ
            =============================================== */}

            {selectedFile && (

              <div className="selected-file">

                <Paperclip size={16} />

                <span>
                  {selectedFile.name}
                </span>


                <button
                  type="button"
                  onClick={() => {

                    setSelectedFile(null);

                    if (
                      fileInputRef.current
                    ) {
                      fileInputRef.current.value = "";
                    }

                  }}
                  aria-label="Supprimer la pièce jointe"
                >

                  <X size={16} />

                </button>

              </div>

            )}


            {/* ===============================================
                FORMULAIRE MESSAGE
            =============================================== */}

            <form
              className="chat-form"
              onSubmit={sendMessage}
            >


              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileChange}
                accept="
                  .pdf,
                  .jpg,
                  .jpeg,
                  .png,
                  .doc,
                  .docx,
                  .xls,
                  .xlsx,
                  .txt
                "
              />


              <button
                type="button"
                className="attachment-button"
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
                title="Ajouter une pièce jointe"
              >

                <Paperclip size={20} />

              </button>


              <input
                type="text"
                value={newMessage}
                onChange={
                  (event) =>
                    setNewMessage(
                      event.target.value
                    )
                }
                placeholder="Écrivez votre message..."
                disabled={sending}
              />


              <button
                type="submit"
                className="send-button"
                disabled={
                  sending
                  || !newMessage.trim()
                }
                aria-label="Envoyer le message"
              >

                {sending ? (

                  <Loader2
                    size={20}
                    className="spin"
                  />

                ) : (

                  <Send size={20} />

                )}

              </button>


            </form>


          </>

        ) : (

          <div className="messaging-empty-chat">

            <MessageCircle size={54} />

            <h2>
              Messagerie StaffHub
            </h2>

            <p>
              Sélectionnez une conversation
              ou créez-en une nouvelle.
            </p>

          </div>

        )}


      </div>


      {/* ===================================================
          MODALE NOUVELLE CONVERSATION
      =================================================== */}

      {showNewConversation && (

        <div className="conversation-modal-overlay">


          <div className="conversation-modal">


            {/* HEADER */}

            <div className="conversation-modal-header">

              <div>

                <h2>
                  Nouvelle conversation
                </h2>

                <p>
                  Démarrez une discussion StaffHub.
                </p>

              </div>


              <button
                type="button"
                onClick={() => {

                  setShowNewConversation(false);

                  setError("");

                }}
                aria-label="Fermer"
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={createConversation}
            >


              {/* TYPE */}

              <div className="conversation-form-group">

                <label htmlFor="type_conversation">
                  Type
                </label>


                <select
                  id="type_conversation"
                  value={
                    conversationForm
                      .type_conversation
                  }
                  onChange={
                    handleConversationTypeChange
                  }
                >

                  <option value="PRIVE">
                    Conversation privée
                  </option>

                  <option value="GROUPE">
                    Groupe
                  </option>

                </select>

              </div>


              {/* SUJET */}

              <div className="conversation-form-group">

                <label htmlFor="conversation_subject">
                  Sujet
                </label>


                <input
                  id="conversation_subject"
                  type="text"
                  value={
                    conversationForm.sujet
                  }
                  onChange={
                    (event) =>
                      setConversationForm(
                        (previous) => ({
                          ...previous,
                          sujet:
                            event.target.value,
                        })
                      )
                  }
                  placeholder="Ex : Question planning"
                />

              </div>


              {/* PARTICIPANTS */}

              <div className="conversation-form-group">

                <label>
                  Participants
                </label>


                <div className="participants-list">


                  {loadingSalaries ? (

                    <div className="messaging-state">

                      <Loader2
                        size={20}
                        className="spin"
                      />

                      <span>
                        Chargement...
                      </span>

                    </div>

                  ) : salaries.length > 0 ? (

                    salaries.map(
                      (salarie) => {

                        const checked = (
                          conversationForm
                            .participants_ids
                            .includes(
                              salarie.id
                            )
                        );


                        return (

                          <label
                            key={salarie.id}
                            className={
                              `participant-option ${
                                checked
                                  ? "participant-selected"
                                  : ""
                              }`
                            }
                          >

                            <input
                              type={
                                conversationForm
                                  .type_conversation
                                === "PRIVE"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={
                                conversationForm
                                  .type_conversation
                                === "PRIVE"
                                  ? "participant"
                                  : undefined
                              }
                              checked={checked}
                              onChange={() =>
                                toggleParticipant(
                                  salarie.id
                                )
                              }
                            />


                            <span className="participant-avatar">

                              {(
                                salarie.prenom
                                ?.charAt(0)
                                || ""
                              )}

                              {(
                                salarie.nom
                                ?.charAt(0)
                                || ""
                              )}

                            </span>


                            <span>

                              <strong>

                                {salarie.prenom}{" "}
                                {salarie.nom}

                              </strong>

                              <small>

                                {salarie.poste
                                  || salarie.role
                                  || salarie.matricule
                                }

                              </small>

                            </span>


                          </label>

                        );

                      }
                    )

                  ) : (

                    <div className="messaging-state">

                      <Users size={24} />

                      <span>
                        Aucun autre salarié disponible
                        avec vos permissions actuelles.
                      </span>

                    </div>

                  )}


                </div>

              </div>


              {/* ERREUR */}

              {error && (

                <div className="messaging-error">

                  {error}

                </div>

              )}


              {/* ACTIONS */}

              <div className="conversation-modal-actions">

                <button
                  type="button"
                  className="conversation-cancel-button"
                  onClick={() =>
                    setShowNewConversation(
                      false
                    )
                  }
                >

                  Annuler

                </button>


                <button
                  type="submit"
                  className="conversation-create-button"
                  disabled={
                    creatingConversation
                  }
                >

                  {creatingConversation ? (

                    <>
                      <Loader2
                        size={17}
                        className="spin"
                      />

                      Création...
                    </>

                  ) : (

                    <>
                      <MessageCircle size={17} />

                      Créer
                    </>

                  )}

                </button>

              </div>


            </form>


          </div>


        </div>

      )}


      </section>
    </main>
  );
}
