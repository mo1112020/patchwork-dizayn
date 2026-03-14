import React from 'react';
import { ToolMode } from '@/types/design';
import { MousePointer, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolPanelProps {
  toolMode: ToolMode;
  onToolChange: (mode: ToolMode) => void;
  /** When true, only show Select – user assigns rugs to template segments only. */
  templateOnly?: boolean;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  toolMode,
  onToolChange,
  templateOnly = true,
}) => {
  const allTools = [
    { mode: 'select' as ToolMode, icon: MousePointer, label: 'Seçim', shortcut: 'V', description: 'Parçayı seç, dokuyu atayın' },
    { mode: 'add' as ToolMode, icon: Plus, label: 'Parça Ekle', shortcut: 'A', description: 'Yeni parça çiz' },
    { mode: 'delete' as ToolMode, icon: Trash2, label: 'Sil', shortcut: 'D', description: 'Parçayı kaldır' },
  ];
  const tools = templateOnly ? allTools.filter((t) => t.mode === 'select') : allTools;

  return (
    <div className="panel">
      <div className="panel-header">Araçlar</div>
      <div className="panel-content space-y-2">
        {tools.map(({ mode, icon: Icon, label, shortcut, description }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onToolChange(mode)}
            className={cn(
              'tool-btn flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all',
              toolMode === mode && 'tool-btn-active'
            )}
            title={description}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              toolMode === mode
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <kbd className="text-[10px] font-mono opacity-60 px-1.5 py-0.5 bg-background/50 rounded border border-border/50">
                  {shortcut}
                </kbd>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
