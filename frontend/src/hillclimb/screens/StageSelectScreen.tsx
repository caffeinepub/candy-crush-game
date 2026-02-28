import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { STAGES, type StageId } from '../stages/stages';
import { ASSETS } from '../assets';

interface StageSelectScreenProps {
  onStageSelected: (stageId: StageId) => void;
  onBack: () => void;
}

export default function StageSelectScreen({ onStageSelected, onBack }: StageSelectScreenProps) {
  return (
    <div className="hillclimb-stage-select">
      <div className="hillclimb-stage-select-header">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="hillclimb-stage-select-title">Select Stage</h1>
      </div>

      <div className="hillclimb-stage-select-content">
        <div className="hillclimb-stage-grid">
          {STAGES.map(stage => (
            <Card key={stage.id} className="hillclimb-stage-card" onClick={() => onStageSelected(stage.id)}>
              <div
                className="hillclimb-stage-preview"
                style={{ backgroundImage: `url(${ASSETS.stages[stage.id]})` }}
              />
              <CardHeader>
                <CardTitle className="hillclimb-stage-name">{stage.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="hillclimb-stage-description">{stage.description}</p>
                <Button className="w-full mt-4">
                  Race Here
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
