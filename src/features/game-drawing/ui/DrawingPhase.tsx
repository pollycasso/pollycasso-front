import { useCallback } from 'react';
import { GameCanvas } from '@/entities/drawing';
import type { DrawLine } from '@/entities/drawing';
import { SOCKET_EVENTS } from '@/shared/api/socket';
import { useGameSocket } from '@/shared/api/socket/GameSocketProvider';

import { useDrawing } from '../model/useDrawing';
import { useDrawingTools } from '../model/useDrawingTools';
import { useDrawingShortcuts } from '../model/useDrawingShortcuts';
import { DrawingToolbox } from './DrawingToolbox';
import { DrawingHistoryButtons } from './DrawingHistoryButtons';
import { ShortcutGuide } from './ShortcutGuide';

export const DrawingPhase = () => {
  const { gameSocket } = useGameSocket();

  const {
    activeTool,
    setActiveTool,
    strokeWidth,
    setStrokeWidth,
    selectedColor,
    setSelectedColor,
  } = useDrawingTools();

  const handleLineComplete = useCallback(
    (line: DrawLine) => {
      if (!gameSocket) return;
      gameSocket.emit(SOCKET_EVENTS.GAME_SEND_DRAWING, {
        line: {
          tool: line.tool,
          color: line.color,
          size: line.size,
          points: line.points,
        },
      });
    },
    [gameSocket],
  );

  const { lines, undo, redo, handleDown, handleMove, handleUp } = useDrawing({
    tool: activeTool,
    color: selectedColor,
    size: strokeWidth,
    onLineComplete: handleLineComplete,
  });

  useDrawingShortcuts({ setActiveTool, setStrokeWidth });

  return (
    <>
      <div className="absolute -top-12 left-6 z-30">
        <ShortcutGuide />
      </div>

      <GameCanvas
        readOnly={false}
        activeTool={activeTool}
        strokeWidth={strokeWidth}
        lines={lines}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <DrawingToolbox
          activeTool={activeTool}
          onToolChange={setActiveTool}
          strokeWidth={strokeWidth}
          onWidthChange={setStrokeWidth}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
        <DrawingHistoryButtons undo={undo} redo={redo} />
      </div>
    </>
  );
};
