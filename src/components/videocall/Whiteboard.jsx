import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useCallback } from "react";

const Whiteboard = ({ socketRef, roomId }) => {
  const excalidrawApiRef = useRef(null);
  const isRemoteUpdate = useRef(false); // flag to skip echo
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleRemoteDraw = ({ elements, appState }) => {
      if (!excalidrawApiRef.current) return;
      isRemoteUpdate.current = true;
      excalidrawApiRef.current.updateScene({
        elements,
        appState: { ...appState, collaborators: new Map() },
      });
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 50);
    };

    socket.on("whiteboard:update", handleRemoteDraw);

    // Re-register if socket reconnects
    const reregister = () => {
      socket.off("whiteboard:update", handleRemoteDraw);
      socket.on("whiteboard:update", handleRemoteDraw);
    };
    socket.on("connect", reregister);

    return () => {
      socket.off("whiteboard:update", handleRemoteDraw);
      socket.off("connect", reregister);
    };
  }, [socketRef]); // socketRef is stable, this runs once — that's fine now that we guard with reregister
  const handleChange = useCallback(
    (elements, appState) => {
      console.log("EMITTING UPDATE", elements.length);

      if (isRemoteUpdate.current) return;
      console.log("handleChange", isRemoteUpdate.current);

      socketRef?.current?.emit("whiteboard:update", {
        roomId,
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemFontFamily: appState.currentItemFontFamily,
        },
      });
    },
    [socketRef, roomId],
  );
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api;
        }}
        onChange={handleChange}
        isCollaborating={true}
      />
    </div>
  );
};

export default Whiteboard;
