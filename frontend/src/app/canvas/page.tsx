'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ZoomIn, ZoomOut, Maximize, Home, Save, Share, Settings, Plus, Move } from 'lucide-react';
import {
  GadgetType,
  GadgetWrapper,
  TimesheetGadget,
  type Position,
  type Gadget,
  type GadgetConfig,
  type TimesheetGadgetConfig
} from './gadgets';
import { GadgetSettings } from './gadgets/GadgetSettings';

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
  height: 48px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CanvasContainer = styled.div<{ isPanning: boolean }>`
  width: 100%;
  height: calc(100% - 48px);
  overflow: hidden;
  position: relative;
  background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
  background-size: 40px 40px;
  cursor: ${props => props.isPanning ? 'grab' : 'default'};
  
  &:active {
    cursor: ${props => props.isPanning ? 'grabbing' : 'default'};
  }
`;

const CanvasControls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'icon' }>`
  padding: ${props => props.variant === 'icon' ? '8px' : '8px 16px'};
  background: ${props => {
    if (props.variant === 'primary') return '#3b82f6';
    if (props.variant === 'icon') return 'transparent';
    return 'white';
  }};
  color: ${props => props.variant === 'primary' ? 'white' : props.variant === 'icon' ? '#64748b' : '#1e293b'};
  border: 1px solid ${props => props.variant === 'icon' ? 'transparent' : '#e2e8f0'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#2563eb';
      if (props.variant === 'icon') return '#f1f5f9';
      return '#f8fafc';
    }};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const getInitialConfig = (type: GadgetType): GadgetConfig => {
  return {
    title: 'Timesheet',
    type: GadgetType.TIMESHEET,
    slug: 'previous-month'
  } as GadgetConfig;
};

const getGadgetContent = (gadget: Gadget) => {
  return <TimesheetGadget config={gadget.config as TimesheetGadgetConfig} />;
};

const gadgetDimensions: Record<GadgetType, { width: number; height: number }> = {
  [GadgetType.TIMESHEET]: { width: 400, height: 400 }
};

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

export default function Canvas() {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [shouldAutoZoom, setShouldAutoZoom] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef<Position>({ x: 0, y: 0 });

  // Recalcula o zoom quando a janela é redimensionada e shouldAutoZoom é true
  useEffect(() => {
    if (!shouldAutoZoom) return;

    const handleResize = () => {
      handleZoomAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldAutoZoom, gadgets]);

  const calculateBoundingBox = () => {
    if (gadgets.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    return gadgets.reduce((bounds, gadget) => {
      const { x, y } = gadget.position;
      const { width, height } = gadgetDimensions[gadget.type];

      return {
        minX: Math.min(bounds.minX, x),
        minY: Math.min(bounds.minY, y),
        maxX: Math.max(bounds.maxX, x + width),
        maxY: Math.max(bounds.maxY, y + height),
      };
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    });
  };

  const handleZoomAll = () => {
    if (gadgets.length === 0) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const bounds = calculateBoundingBox();
    const padding = 100;

    const containerWidth = canvasRef.current?.clientWidth || window.innerWidth;
    const containerHeight = canvasRef.current?.clientHeight || window.innerHeight;

    const contentWidth = (bounds.maxX - bounds.minX) + (padding * 2);
    const contentHeight = (bounds.maxY - bounds.minY) + (padding * 2);

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    
    const newScale = Math.min(scaleX, scaleY);

    const contentCenterX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const contentCenterY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

    const newPosition = {
      x: (containerWidth / 2) - (contentCenterX * newScale),
      y: (containerHeight / 2) - (contentCenterY * newScale)
    };

    setScale(newScale);
    setPosition(newPosition);
    setShouldAutoZoom(true); // Ativa o auto-zoom após o primeiro zoom total
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

  const handleAddGadget = () => {
    const newGadget: Gadget = {
      id: `gadget-${Date.now()}`,
      type: GadgetType.TIMESHEET,
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      config: getInitialConfig(GadgetType.TIMESHEET)
    };
    setGadgets([...gadgets, newGadget]);
  };

  const handleRemoveGadget = (id: string) => {
    setGadgets(gadgets.filter(gadget => gadget.id !== id));
  };

  const handleGadgetDragEnd = (id: string, newPosition: Position) => {
    setGadgets(gadgets.map(gadget => 
      gadget.id === id ? { ...gadget, position: newPosition } : gadget
    ));
  };

  const handleConfigureGadget = (gadget: Gadget) => {
    setSelectedGadget(gadget);
  };

  const handleSaveConfig = (id: string, config: GadgetConfig) => {
    setGadgets(gadgets.map(gadget =>
      gadget.id === id ? { ...gadget, config } : gadget
    ));
    setSelectedGadget(null);
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
          <Button variant="primary" onClick={handleAddGadget}>
            <Plus /> Add Timesheet
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
            scale,
            x: position.x,
            y: position.y,
          }}
        >
          {gadgets.map((gadget) => (
            <GadgetWrapper
              key={gadget.id}
              id={gadget.id}
              position={gadget.position}
              type={gadget.type}
              config={gadget.config}
              onRemove={handleRemoveGadget}
              onDragEnd={handleGadgetDragEnd}
              onConfigure={handleConfigureGadget}
            >
              {getGadgetContent(gadget)}
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

      {selectedGadget && (
        <GadgetSettings
          gadget={selectedGadget}
          isOpen={true}
          onClose={() => setSelectedGadget(null)}
          onSave={handleSaveConfig}
        />
      )}
    </PageWrapper>
  );
}
