import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Position, GadgetConfig } from './types';

const Wrapper = styled.div<{ isDragging?: boolean }>`
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: #f8fafc;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const HeaderButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface Props {
  id: string;
  position: Position;
  config: GadgetConfig;
  onDragEnd: (id: string, newPosition: Position) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}

export function GadgetWrapper({
  id,
  position,
  config,
  onDragEnd,
  onRemove,
  children
}: Props) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<Position | null>(null);
  const [initialPosition, setInitialPosition] = React.useState<Position | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPosition(position);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart && initialPosition) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onDragEnd(id, {
        x: initialPosition.x + deltaX,
        y: initialPosition.y + deltaY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setInitialPosition(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <Wrapper
      style={{ left: position.x, top: position.y }}
      isDragging={isDragging}
    >
      <Header onMouseDown={handleMouseDown}>
        <Title>{config.title}</Title>
        <div style={{ display: 'flex', gap: '4px' }}>
          <HeaderButton onClick={() => onRemove(id)}>
            <X />
          </HeaderButton>
        </div>
      </Header>
      {children}
    </Wrapper>
  );
} 