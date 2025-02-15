import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Gadget, 
  GadgetConfig, 
  GadgetType,
  TimesheetGadgetConfig
} from './types';
import { TimesheetSettings } from './Timesheet';

interface GadgetSettingsProps {
  gadget: Gadget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, config: GadgetConfig) => void;
}

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export function GadgetSettings({ gadget, isOpen, onClose, onSave }: GadgetSettingsProps) {
  const [config, setConfig] = useState<GadgetConfig>(gadget.config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(gadget.id, config);
  };

  const renderSpecificSettings = () => {
    switch (gadget.type) {
      case GadgetType.TIMESHEET:
        return <TimesheetSettings 
          config={config as TimesheetGadgetConfig} 
          onChange={(newConfig) => setConfig(newConfig)} 
        />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Gadget Settings</SheetTitle>
          <SheetDescription>
            Configure your gadget settings here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <SettingsForm onSubmit={handleSubmit}>
          {renderSpecificSettings()}

          <ButtonGroup>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </ButtonGroup>
        </SettingsForm>
      </SheetContent>
    </Sheet>
  );
} 