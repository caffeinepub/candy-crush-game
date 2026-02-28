import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import SpaceSnakeScreen from './snake/SpaceSnakeScreen';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#0a1a3a',
        }}
      >
        <SpaceSnakeScreen />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
