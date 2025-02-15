'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ZoomIn, ZoomOut, Maximize, Home, Save, Share, Settings, Plus, Move } from 'lucide-react';
import {
  GadgetType,
  GadgetWrapper,
  TimesheetGadget,
  ByClientGadget,
  type Position,
  type Gadget,
  type GadgetConfig,
  type TimesheetGadgetConfig,
  type ByClientGadgetConfig
} from './gadgets';

const PageWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  height: 56px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CanvasContainer = styled.div<{ isPanning: boolean }>`
  width: 100%;
  height: calc(100% - 56px);
  overflow: hidden;
  position: relative;
  background-color: #f1f5f9;
  background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
  background-size: 40px 40px;
  cursor: ${props => props.isPanning ? 'grab' : 'default'};
  
  &:active {
    cursor: ${props => props.isPanning ? 'grabbing' : 'default'};
  }
`;

const CanvasControls = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'icon' }>`
  padding: ${props => props.variant === 'icon' ? '8px' : '8px 16px'};
  background: ${props => {
    if (props.variant === 'primary') return '#3b82f6';
    if (props.variant === 'icon') return 'transparent';
    return 'white';
  }};
  color: ${props => props.variant === 'primary' ? 'white' : props.variant === 'icon' ? '#64748b' : '#1e293b'};
  border: 1px solid ${props => props.variant === 'icon' ? 'transparent' : props.variant === 'primary' ? '#3b82f6' : '#e2e8f0'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#2563eb';
      if (props.variant === 'icon') return '#f1f5f9';
      return '#f8fafc';
    }};
    border-color: ${props => props.variant === 'primary' ? '#2563eb' : '#cbd5e1'};
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const GRID_SIZE = 8; // Reduzindo o tamanho da grade para posicionamento mais preciso
const PADDING = 12; // Margem entre elementos menor
const CANVAS_MARGIN = 16; // Margem do canvas

const getInitialConfig = (type: GadgetType): GadgetConfig => {
  switch (type) {
    case GadgetType.TIMESHEET:
      return {
        type: GadgetType.TIMESHEET,
        title: 'Timesheet',
        selectedPeriods: [
          { label: "Previous Month", value: "previous-month" },
          { label: "This Month", value: "this-month" }
        ]
      } as TimesheetGadgetConfig;
    case GadgetType.BY_CLIENT:
      return {
        type: GadgetType.BY_CLIENT,
        title: 'By Client',
        slug: 'previous-month'
      } as ByClientGadgetConfig;
    default:
      throw new Error(`Unsupported gadget type: ${type}`);
  }
};

const getGadgetContent = (
  gadget: Gadget, 
  id: string, 
  position: Position,
  onAddGadget: (type: GadgetType, config: GadgetConfig) => void
) => {
  switch (gadget.type) {
    case GadgetType.TIMESHEET:
      return <TimesheetGadget 
        id={id}
        position={position}
        type={gadget.type}
        config={gadget.config as TimesheetGadgetConfig}
        onAddGadget={onAddGadget}
      />;
    case GadgetType.BY_CLIENT:
      return <ByClientGadget 
        id={id}
        position={position}
        type={gadget.type}
        config={gadget.config as ByClientGadgetConfig}
      />;
    default:
      return null;
  }
};

const gadgetDimensions = {
  [GadgetType.TIMESHEET]: { width: 600, height: 300 },
  [GadgetType.BY_CLIENT]: { width: 400, height: 400 }
} as const;

interface GadgetWrapperProps {
  id: string;
  position: Position;
  type: GadgetType;
  config: GadgetConfig;
  onDragEnd: (id: string, newPosition: Position) => void;
  onRemove: (id: string) => void;
  onConfigure: (gadget: Gadget) => void;
  children: React.ReactNode;
}

const findBestGadgetPosition = (
  existingGadgets: Gadget[],
  newGadgetType: GadgetType,
  canvasRef: React.RefObject<HTMLDivElement>
): Position => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: CANVAS_MARGIN, y: CANVAS_MARGIN };

  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  const newGadgetDimensions = gadgetDimensions[newGadgetType];

  // Se não houver gadgets, começar no canto superior esquerdo
  if (existingGadgets.length === 0) {
    return { x: CANVAS_MARGIN, y: CANVAS_MARGIN };
  }

  // Criar um mapa de ocupação do espaço
  type Space = { x: number; y: number; width: number; height: number };
  const occupiedSpaces: Space[] = existingGadgets.map(gadget => ({
    x: gadget.position.x,
    y: gadget.position.y,
    width: gadgetDimensions[gadget.type].width,
    height: gadgetDimensions[gadget.type].height
  }));

  // Encontrar todos os espaços disponíveis
  const findAvailableSpaces = (): Space[] => {
    const spaces: Space[] = [];
    const usedYPositions = new Set(occupiedSpaces.map(s => s.y));
    const sortedYPositions = Array.from(usedYPositions).sort((a, b) => a - b);

    // Adicionar espaço no topo se houver
    if (sortedYPositions[0] > CANVAS_MARGIN + PADDING) {
      spaces.push({
        x: CANVAS_MARGIN,
        y: CANVAS_MARGIN,
        width: canvasWidth - CANVAS_MARGIN * 2,
        height: sortedYPositions[0] - CANVAS_MARGIN - PADDING
      });
    }

    // Para cada linha de gadgets, encontrar espaços horizontais
    sortedYPositions.forEach(y => {
      const gadgetsInRow = occupiedSpaces.filter(s => s.y === y)
        .sort((a, b) => a.x - b.x);

      // Espaços entre gadgets na mesma linha
      for (let i = 0; i < gadgetsInRow.length - 1; i++) {
        const current = gadgetsInRow[i];
        const next = gadgetsInRow[i + 1];
        const spaceWidth = next.x - (current.x + current.width + PADDING * 2);
        
        if (spaceWidth >= newGadgetDimensions.width) {
          spaces.push({
            x: current.x + current.width + PADDING,
            y,
            width: spaceWidth,
            height: current.height
          });
        }
      }

      // Espaço à direita do último gadget na linha
      const lastInRow = gadgetsInRow[gadgetsInRow.length - 1];
      const rightSpace = canvasWidth - CANVAS_MARGIN - (lastInRow.x + lastInRow.width + PADDING);
      if (rightSpace >= newGadgetDimensions.width) {
        spaces.push({
          x: lastInRow.x + lastInRow.width + PADDING,
          y,
          width: rightSpace,
          height: lastInRow.height
        });
      }
    });

    // Adicionar espaço para uma nova linha abaixo de todos os gadgets
    const maxY = Math.max(...occupiedSpaces.map(s => s.y + s.height));
    if (maxY + newGadgetDimensions.height + PADDING <= canvasHeight - CANVAS_MARGIN) {
      spaces.push({
        x: CANVAS_MARGIN,
        y: maxY + PADDING,
        width: canvasWidth - CANVAS_MARGIN * 2,
        height: canvasHeight - maxY - CANVAS_MARGIN - PADDING
      });
    }

    return spaces;
  };

  // Função para verificar se um espaço é adequado
  const isSpaceValid = (space: Space): boolean => {
    return space.width >= newGadgetDimensions.width &&
           space.height >= newGadgetDimensions.height;
  };

  // Função para calcular a pontuação de um espaço
  const getSpaceScore = (space: Space): number => {
    let score = 0;
    
    // Preferir espaços mais próximos ao topo
    score -= space.y * 0.1;
    
    // Preferir espaços que alinham com outros gadgets
    const alignsWithOthers = occupiedSpaces.some(s => 
      Math.abs(s.x - space.x) < GRID_SIZE || 
      Math.abs((s.x + s.width) - (space.x + newGadgetDimensions.width)) < GRID_SIZE
    );
    if (alignsWithOthers) score += 50;

    // Preferir espaços que completam uma linha
    const completeRow = occupiedSpaces.some(s => 
      Math.abs(s.y - space.y) < GRID_SIZE &&
      Math.abs(s.x + s.width + PADDING - space.x) < GRID_SIZE
    );
    if (completeRow) score += 100;

    return score;
  };

  // Encontrar o melhor espaço disponível
  const availableSpaces = findAvailableSpaces()
    .filter(isSpaceValid)
    .map(space => ({
      space,
      score: getSpaceScore(space)
    }))
    .sort((a, b) => b.score - a.score);

  if (availableSpaces.length > 0) {
    const bestSpace = availableSpaces[0].space;
    return {
      x: bestSpace.x,
      y: bestSpace.y
    };
  }

  // Se não encontrar nenhum espaço adequado, retornar posição padrão
  return { x: CANVAS_MARGIN, y: CANVAS_MARGIN };
};

export default function Canvas() {
  const [gadgets, setGadgets] = useState<Gadget[]>(() => {
    // Calculate months
    const now = new Date();
    
    // Two months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const twoMonthsAgoName = twoMonthsAgo.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const twoMonthsAgoYear = twoMonthsAgo.getFullYear();
    const twoMonthsAgoSlug = `${twoMonthsAgoName}-${twoMonthsAgoYear}`;
    const twoMonthsAgoLabel = `${twoMonthsAgoName.charAt(0).toUpperCase() + twoMonthsAgoName.slice(1)} ${twoMonthsAgoYear}`;

    // Previous month
    const previousMonth = new Date();
    previousMonth.setMonth(now.getMonth() - 1);
    const previousMonthName = previousMonth.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const previousMonthYear = previousMonth.getFullYear();
    const previousMonthSlug = `${previousMonthName}-${previousMonthYear}`;
    const previousMonthLabel = `${previousMonthName.charAt(0).toUpperCase() + previousMonthName.slice(1)} ${previousMonthYear}`;

    // Current month
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const currentMonthYear = now.getFullYear();
    const currentMonthSlug = `${currentMonthName}-${currentMonthYear}`;
    const currentMonthLabel = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} ${currentMonthYear}`;

    // Create initial timesheet gadget
    const initialGadget: Gadget = {
      id: `${GadgetType.TIMESHEET}-${Date.now()}`,
      type: GadgetType.TIMESHEET,
      position: { x: 16, y: 16 },
      config: {
        type: GadgetType.TIMESHEET,
        title: 'Timesheet',
        selectedPeriods: [
          { label: twoMonthsAgoLabel, value: twoMonthsAgoSlug },
          { label: previousMonthLabel, value: previousMonthSlug },
          { label: currentMonthLabel, value: currentMonthSlug }
        ]
      } as TimesheetGadgetConfig
    };

    return [initialGadget];
  });

  const [selectedGadgetId, setSelectedGadgetId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [shouldAutoZoom, setShouldAutoZoom] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef<Position>({ x: 0, y: 0 });

  // Select the first gadget by default
  useEffect(() => {
    if (gadgets.length > 0 && !selectedGadgetId) {
      setSelectedGadgetId(gadgets[0].id);
    }
  }, [gadgets.length]);

  // Recalcula o zoom quando a janela é redimensionada e shouldAutoZoom é true
  useEffect(() => {
    if (!shouldAutoZoom) return;

    const handleResize = () => {
      handleZoomAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldAutoZoom, gadgets]);

  const handleZoomAll = () => {
    if (!canvasRef.current || gadgets.length === 0) return;

    // Get canvas dimensions
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // Calculate bounding box of all gadgets
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    gadgets.forEach(gadget => {
      const dimensions = gadgetDimensions[gadget.type];
      minX = Math.min(minX, gadget.position.x);
      minY = Math.min(minY, gadget.position.y);
      maxX = Math.max(maxX, gadget.position.x + dimensions.width);
      maxY = Math.max(maxY, gadget.position.y + dimensions.height);
    });

    // Add padding
    const padding = 48;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate required scale
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const newScale = Math.min(Math.min(scaleX, scaleY), 1); // Cap at 1 to prevent zooming in too much

    // Calculate position to center content
    const scaledContentWidth = contentWidth * newScale;
    const scaledContentHeight = contentHeight * newScale;
    const newX = (canvasWidth - scaledContentWidth) / 2 - minX * newScale;
    const newY = (canvasHeight - scaledContentHeight) / 2 - minY * newScale;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanning && e.button === 0) { // Left click while panning mode is active
      isDragging.current = true;
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const togglePanning = () => {
    setIsPanning(!isPanning);
  };

  const handleAddGadget = (type: GadgetType) => {
    const newPosition = findBestGadgetPosition(gadgets, type, canvasRef);
    const config = getInitialConfig(type);
    const newGadget: Gadget = {
      id: `${type}-${Date.now()}`,
      type,
      position: newPosition,
      config
    };

    setGadgets([...gadgets, newGadget]);
    setSelectedGadgetId(newGadget.id);
  };

  const handleRemoveGadget = (id: string) => {
    setGadgets(gadgets.filter(gadget => gadget.id !== id));
    if (selectedGadgetId === id) {
      // If we're removing the selected gadget, select the last one in the list
      const remainingGadgets = gadgets.filter(g => g.id !== id);
      setSelectedGadgetId(remainingGadgets.length > 0 ? remainingGadgets[remainingGadgets.length - 1].id : null);
    }
  };

  const handleGadgetDragEnd = (id: string, newPosition: Position) => {
    setGadgets(gadgets.map(gadget => 
      gadget.id === id ? { ...gadget, position: newPosition } : gadget
    ));
  };

  const handleGadgetSelect = (id: string) => {
    if (id !== selectedGadgetId) {
      setSelectedGadgetId(id);
      // Move the selected gadget to the end of the array to render it last (on top)
      setGadgets(prev => {
        const gadget = prev.find(g => g.id === id);
        if (!gadget) return prev;
        return [...prev.filter(g => g.id !== id), gadget];
      });
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <PageWrapper>
      <TopBar>
        <ToolbarGroup>
          <Button variant="icon" onClick={togglePanning}>
            <Move />
          </Button>
          <Button variant="primary" onClick={() => handleAddGadget(GadgetType.TIMESHEET)}>
            <Plus /> Add Timesheet
          </Button>
          <Button variant="primary" onClick={() => handleAddGadget(GadgetType.BY_CLIENT)}>
            <Plus /> Add By Client
          </Button>
        </ToolbarGroup>
        <ToolbarGroup>
          <Button variant="icon" onClick={() => setShouldAutoZoom(!shouldAutoZoom)}>
            <Maximize />
          </Button>
          <Button variant="icon" onClick={handleZoomAll}>
            <Home />
          </Button>
        </ToolbarGroup>
      </TopBar>

      <CanvasContainer
        ref={canvasRef}
        isPanning={isPanning}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformOrigin: '0 0',
            x: position.x,
            y: position.y,
            scale: scale,
          }}
        >
          {gadgets.map((gadget, index) => (
            <GadgetWrapper
              key={gadget.id}
              id={gadget.id}
              position={gadget.position}
              config={gadget.config}
              onRemove={handleRemoveGadget}
              onDragEnd={handleGadgetDragEnd}
              onSelect={handleGadgetSelect}
              isSelected={gadget.id === selectedGadgetId}
              zIndex={index + 1}
            >
              {getGadgetContent(gadget, gadget.id, gadget.position, handleAddGadget)}
            </GadgetWrapper>
          ))}
        </motion.div>

        <CanvasControls>
          <Button variant="icon" onClick={handleZoomIn}>
            <ZoomIn />
          </Button>
          <Button variant="icon" onClick={handleZoomOut}>
            <ZoomOut />
          </Button>
        </CanvasControls>
      </CanvasContainer>
    </PageWrapper>
  );
}
