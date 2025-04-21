
import { useState } from 'react';
import InterfaceDetection from '@/components/InterfaceDetection';
import SessionLauncher from '@/components/SessionLauncher';
import TrackView from '@/components/TrackView';
import { SessionTemplate } from '@/types';

const Index = () => {
  const [interfaceDetected, setInterfaceDetected] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SessionTemplate | null>(null);
  
  const handleInterfaceDetected = () => {
    setInterfaceDetected(true);
  };
  
  const handleSessionSelect = (template: SessionTemplate) => {
    setSelectedTemplate(template);
  };
  
  const handleBackToSessionLauncher = () => {
    setSelectedTemplate(null);
  };
  
  return (
    <div className="min-h-screen bg-fever-black">
      {!interfaceDetected && (
        <InterfaceDetection onDetected={handleInterfaceDetected} />
      )}
      
      {interfaceDetected && !selectedTemplate && (
        <SessionLauncher onSessionSelect={handleSessionSelect} />
      )}
      
      {interfaceDetected && selectedTemplate && (
        <TrackView 
          sessionTemplate={selectedTemplate} 
          onBack={handleBackToSessionLauncher} 
        />
      )}
    </div>
  );
};

export default Index;
