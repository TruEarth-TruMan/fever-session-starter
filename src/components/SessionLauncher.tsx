
import { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sessionTemplates } from '@/data/templates';
import { SessionTemplate } from '@/types';
import { Mic, AudioWaveform, Music, Music2, Music4 } from 'lucide-react';

interface SessionLauncherProps {
  onSessionSelect: (template: SessionTemplate) => void;
}

const SessionLauncher = ({ onSessionSelect }: SessionLauncherProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'mic':
        return <Mic className="h-8 w-8" />;
      case 'audio-waveform':
        return <AudioWaveform className="h-8 w-8" />;
      case 'music':
        return <Music className="h-8 w-8" />;
      case 'music-2':
        return <Music2 className="h-8 w-8" />;
      case 'music-4':
        return <Music4 className="h-8 w-8" />;
      default:
        return <Music className="h-8 w-8" />;
    }
  };
  
  const handleSessionSelect = () => {
    const template = sessionTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      onSessionSelect(template);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto pt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-fever-red">Fever</h1>
        <p className="text-xl text-fever-light/80">What are you recording today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sessionTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer border-2 transition-all ${
              selectedTemplate === template.id 
                ? 'border-fever-red bg-fever-dark' 
                : 'border-transparent bg-fever-dark/50 hover:bg-fever-dark/70'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-fever-light">{template.name}</CardTitle>
                <div className={`p-2 rounded-full ${
                  selectedTemplate === template.id ? 'text-fever-red' : 'text-fever-light/70'
                }`}>
                  {getIcon(template.iconName)}
                </div>
              </div>
              <CardDescription className="text-fever-light/70">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-fever-light/70">
                <p>{template.tracks.length} pre-configured tracks</p>
                <p>{template.tracks.reduce((count, track) => count + track.fx.length, 0)} effects included</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={handleSessionSelect}
          disabled={!selectedTemplate}
          className="bg-fever-red hover:bg-fever-red/80 text-white px-8 py-6 text-lg rounded-full w-full max-w-xs"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
};

export default SessionLauncher;
