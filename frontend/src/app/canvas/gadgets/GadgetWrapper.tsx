import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Position, Gadget } from './types';

const Wrapper = styled(motion.div)`
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: move;
`;

const Title = styled.div`
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
`;

const Controls = styled.div`
  display: flex;
  gap: 4px;
`;

interface GadgetWrapperProps {
  id: string;
  position: Position;
  config: Gadget['config'];
  onDragEnd: (id: string, newPosition: Position) => void;
  onRemove: (id: string) => void;
  onConfigure: (gadget: Gadget) => void;
  children: React.ReactNode;
}

export function GadgetWrapper({
  id,
  position,
  config,
  onDragEnd,
  onRemove,
  onConfigure,
  children
}: GadgetWrapperProps) {
  return (
    <Wrapper
      drag
      dragMomentum={false}
      style={{ x: position.x, y: position.y }}
      onDragEnd={(_, info) => {
        onDragEnd(id, {
          x: position.x + info.offset.x,
          y: position.y + info.offset.y
        });
      }}
    >
      <Header>
        <Title>{config.title}</Title>
        <Controls>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onConfigure({ id, position, type: config.type, config })}
          >
            <Settings size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(id)}
          >
            <X size={16} />
          </Button>
        </Controls>
      </Header>
      {children}
    </Wrapper>
  );
} 