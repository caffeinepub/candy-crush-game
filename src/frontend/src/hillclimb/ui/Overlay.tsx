import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
}

export default function Overlay({ children }: OverlayProps) {
  return (
    <div className="hillclimb-overlay">
      <Card className="hillclimb-overlay-card">
        {children}
      </Card>
    </div>
  );
}
