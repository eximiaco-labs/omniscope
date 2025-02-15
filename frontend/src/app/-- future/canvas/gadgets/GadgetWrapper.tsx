import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { GadgetConfig, Position } from './types';

interface WrapperProps {
  isSelected: boolean;
  zIndex: number;
}

const Wrapper = styled(motion.div)<WrapperProps>`
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  z-index: ${props => props.zIndex};
  border: 1px solid ${props => props.isSelected ? '#3b82f6' : '#e2e8f0'};

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const Header = styled.div<{ isSelected: boolean }>`
  height: 32px;
  padding: 0 8px;
  background: ${props => props.isSelected ? '#3b82f6' : '#f8fafc'};
  border-bottom: 1px solid ${props => props.isSelected ? '#2563eb' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;

  h3 {
    font-size: 0.75rem;
    font-weight: 500;
    color: ${props => props.isSelected ? 'white' : '#1e293b'};
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button<{ isSelected?: boolean }>`
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${props => props.isSelected ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

interface GadgetWrapperProps {
  id: string;
  position: Position;
  config: GadgetConfig;
  onRemove: (id: string) => void;
  onDragEnd: (id: string, newPosition: Position) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  zIndex: number;
  children: React.ReactNode;
}

export function GadgetWrapper({
  id,
  position,
  config,
  onRemove,
  onDragEnd,
  onSelect,
  isSelected,
  zIndex,
  children
}: GadgetWrapperProps) {
  const handleDragEnd = (_: any, info: any) => {
    onDragEnd(id, {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    });
  };

  const handleClick = () => {
    onSelect(id);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Prevent click from triggering when clicking buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onSelect(id);
  };

  return (
    <Wrapper
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ x: position.x, y: position.y }}
      isSelected={isSelected}
      zIndex={zIndex}
      onClick={handleClick}
    >
      <Header isSelected={isSelected} onClick={handleHeaderClick}>
        <h3>{config.title}</h3>
        <HeaderActions>
          <IconButton 
            isSelected={isSelected} 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            <X />
          </IconButton>
        </HeaderActions>
      </Header>
      {children}
    </Wrapper>
  );
} 