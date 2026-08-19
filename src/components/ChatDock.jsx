import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Search, Minus } from "lucide-react";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionSlice";
import ChatThreadWindow from "./ChatThreadWindow";

// LinkedIn-style floating messaging dock. Reuses the same connections data
// (GET /user/connection) and chat logic already used by Connection.jsx /
// Chat.jsx — this only repositions that functionality into a persistent
// bottom-right overlay instead of a full navigation.
const ChatDock = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const connections = useSelector(
    (store) => store.connection?.connections || []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [search, setSearch] = useState("");
  const [activeThread, setActiveThread] = useState(null);
  const [loadingConnections, setLoadingConnections] = useState(false);

  const isFullChatRoute = /^\/chat\//.test(location.pathname);
  const isAllowedRoute =
    location.pathname === "/feed" || location.pathname === "/mentor/dashboard";

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchConnections = async () => {
      setLoadingConnections(true);
      try {
        const res = await axios.get(`${BASE_URL}/user/connection`, {
          withCredentials: true,
        });
        dispatch(addConnections(res.data.connections || res.data || []));
      } catch (err) {
        console.error("Failed to load connections", err);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, [isOpen, user, dispatch]);

  // Only show on the Student Feed and Mentor Dashboard — not on every route,
  // and never while logged out or already on the full-page chat route.
  if (!user || isFullChatRoute || !isAllowedRoute) return null;

  const filteredConnections = connections.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return name.includes(search.trim().toLowerCase());
  });

  const openPanel = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closePanel = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setActiveThread(null);
    setSearch("");
  };

  const openThread = (person) => setActiveThread(person);
  const backToList = () => setActiveThread(null);

  return (
    <div className="fixed bottom-0 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* PANEL */}
      {isOpen && (
        <div
          className={`mb-0 w-[85vw] max-w-75 sm:w-72 bg-white rounded-t-xl shadow-2xl border border-gray-200 border-b-0 flex flex-col overflow-hidden transition-[height] ${
            isMinimized ? "h-11" : "h-95 max-h-[55vh]"
          }`}
        >
          {/* DOCK HEADER */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-emerald-600 text-white shrink-0">
            <button
              onClick={() => setIsMinimized((m) => !m)}
              className="flex items-center gap-2 min-w-0 text-left"
            >
              <MessageCircle size={16} className="text-white shrink-0" />
              <span className="text-[13px] font-semibold truncate">
                {activeThread
                  ? `${activeThread.firstName} ${activeThread.lastName}`
                  : "Messaging"}
              </span>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMinimized((m) => !m)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minus size={16} />
              </button>
              <button
                onClick={closePanel}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                aria-label="Close messaging"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* BODY */}
          {!isMinimized && (
            <div className="flex-1 min-h-0">
              {activeThread ? (
                <ChatThreadWindow
                  targetUser={activeThread}
                  onBack={backToList}
                />
              ) : (
                <div className="flex flex-col h-full min-h-0">
                  {/* SEARCH */}
                  <div className="px-3 py-2.5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                      <Search size={15} className="text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search messages"
                        className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* CONVERSATION LIST */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {loadingConnections ? (
                      <p className="text-sm text-gray-400 text-center mt-8">
                        Loading…
                      </p>
                    ) : filteredConnections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center px-6 mt-10">
                        <MessageCircle size={28} className="text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">
                          {connections.length === 0
                            ? "No connections yet"
                            : "No matches found"}
                        </p>
                        {connections.length === 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Connect with mentors to start chatting.
                          </p>
                        )}
                      </div>
                    ) : (
                      <ul>
                        {filteredConnections.map((person) => (
                          <li key={person._id}>
                            <button
                              onClick={() => openThread(person)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 transition-colors text-left"
                            >
                              <img
                                src={person.profilePic || "/default-avatar.png"}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-gray-900 truncate">
                                  {person.firstName} {person.lastName}
                                </p>
                                <p className="text-[11.5px] text-gray-500 truncate capitalize">
                                  {person.department || person.role || "Mentor"}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={openPanel}
          className="mb-4 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-colors"
          aria-label="Open messaging"
        >
          <MessageCircle size={19} />
          <span className="text-sm font-semibold hidden sm:inline">
            Messaging
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatDock;
