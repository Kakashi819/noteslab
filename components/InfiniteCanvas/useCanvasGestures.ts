import { useRef, useState } from 'react';
import { PanResponder, PanResponderInstance, GestureResponderEvent, PanResponderGestureState } from 'react-native';

export type CanvasTool = 'draw' | 'erase' | 'pan';

export interface UseCanvasGesturesResult {
  panResponder: PanResponderInstance;
  scale: number;
  translateX: number;
  translateY: number;
  isDrawing: boolean;
  currentPath: string | null;
  onDrawStart: (x: number, y: number) => void;
  onDrawMove: (x: number, y: number) => void;
  onDrawEnd: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  onErase: (x: number, y: number) => void;
}

export function useCanvasGestures(
  tool: CanvasTool,
  onPathsChange: (paths: any[]) => void,
  paths: any[],
  eraserSize: number
): UseCanvasGesturesResult {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialDistance = useRef(0);
  const isZooming = useRef(false);
  const isPanning = useRef(false);

  const screenToCanvas = (x: number, y: number) => {
    return {
      x: (x - translateX) / scale,
      y: (y - translateY) / scale,
    };
  };

  const onDrawStart = (x: number, y: number) => {
    const { x: canvasX, y: canvasY } = screenToCanvas(x, y);
    setCurrentPath(`M${canvasX.toFixed(1)},${canvasY.toFixed(1)}`);
    setIsDrawing(true);
  };

  const onDrawMove = (x: number, y: number) => {
    if (!isDrawing) return;
    const { x: canvasX, y: canvasY } = screenToCanvas(x, y);
    setCurrentPath((prev) => `${prev} L${canvasX.toFixed(1)},${canvasY.toFixed(1)}`);
  };

  const onDrawEnd = () => {
    if (currentPath) {
      // onPathsChange([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const onErase = (x: number, y: number) => {
    const { x: canvasX, y: canvasY } = screenToCanvas(x, y);
    const newPaths = paths.filter((path) => {
      // This is a simple eraser logic that checks if any point in the path is within the eraser size.
      // A more advanced implementation would involve path intersection.
      const points = path.d.split(' ').map((p: string) => p.split(','));
      for (const point of points) {
        if (point.length === 2) {
          const px = parseFloat(point[0].replace('M', '').replace('L', ''));
          const py = parseFloat(point[1]);
          const distance = Math.hypot(px - canvasX, py - canvasY);
          if (distance < eraserSize / scale) {
            return false;
          }
        }
      }
      return true;
    });
    onPathsChange(newPaths);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 10));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length >= 2) {
        isZooming.current = true;
        isPanning.current = true;
        initialDistance.current = Math.hypot(
          touches[0].pageX - touches[1].pageX,
          touches[0].pageY - touches[1].pageY
        );
        lastScale.current = scale;
      } else if (touches.length === 1) {
        if (tool === 'draw') {
          const { pageX, pageY } = touches[0];
          onDrawStart(pageX, pageY);
        } else if (tool === 'pan') {
          isPanning.current = true;
        } else if (tool === 'erase') {
          const { pageX, pageY } = touches[0];
          onErase(pageX, pageY);
        }
      }
      lastTranslateX.current = translateX;
      lastTranslateY.current = translateY;
    },
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const touches = evt.nativeEvent.touches;
      if (isZooming.current && touches.length >= 2) {
        const newDistance = Math.hypot(
          touches[0].pageX - touches[1].pageX,
          touches[0].pageY - touches[1].pageY
        );
        const newScale = lastScale.current * (newDistance / initialDistance.current);
        setScale(Math.max(0.1, Math.min(newScale, 10)));
      } else if (isPanning.current && touches.length === 1) {
        setTranslateX(lastTranslateX.current + gestureState.dx);
        setTranslateY(lastTranslateY.current + gestureState.dy);
      } else if (tool === 'draw' && isDrawing && touches.length === 1) {
        const { pageX, pageY } = touches[0];
        onDrawMove(pageX, pageY);
      } else if (tool === 'erase' && touches.length === 1) {
        const { pageX, pageY } = touches[0];
        onErase(pageX, pageY);
      }
    },
    onPanResponderRelease: () => {
      isZooming.current = false;
      isPanning.current = false;
      if (isDrawing) {
        onDrawEnd();
      }
    },
  });

  return {
    panResponder,
    scale,
    translateX,
    translateY,
    isDrawing,
    currentPath,
    onDrawStart,
    onDrawMove,
    onDrawEnd,
    zoomIn,
    zoomOut,
    onErase,
  };
}
 