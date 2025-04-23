
import { useState } from 'react';
import InterfaceDetection from '@/components/InterfaceDetection';
import SessionLauncher from '@/components/SessionLauncher';
import TrackView from '@/components/TrackView';
import { SessionTemplate } from '@/types';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import HelpButton from '@/components/help/HelpButton';
import HeatMizerButton from '@/components/assistant/HeatMizerButton';

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
        <>
          <TrackView
            sessionTemplate={selectedTemplate}
            onBack={handleBackToSessionLauncher}
          />
          <div className="fixed bottom-4 right-4 flex gap-2 z-50">
            <HelpButton />
            <FeedbackButton />
            <HeatMizerButton />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
