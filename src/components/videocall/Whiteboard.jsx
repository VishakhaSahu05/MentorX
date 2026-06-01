import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useCallback } from "react";

const Whiteboard = ({ socketRef, roomId }) => {
  const excalidrawApiRef = useRef(null);
  const isRemoteUpdate   = useRef(false); // flag to skip echo
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleRemoteDraw = ({ elements, appState }) => {
      if (!excalidrawApiRef.current) return;
      isRemoteUpdate.current = true;          
      excalidrawApiRef.current.updateScene({
        elements,
        appState: {
          ...appState,
          collaborators: new Map(),           
        },
      });
      isRemoteUpdate.current = false;
    };

    socket.on("whiteboard:update", handleRemoteDraw);
    return () => socket.off("whiteboard:update", handleRemoteDraw);
  }, [socketRef]);

  const handleChange = useCallback(
    (elements, appState) => {
      if (isRemoteUpdate.current) return;     // skip echoing remote changes
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
        excalidrawAPI={(api) => { excalidrawApiRef.current = api; }}
        onChange={handleChange}
        isCollaborating={true}
      />
    </div>
  );
};

export default Whiteboard;
