import { displayStyle } from '@shared-components/theme';
import { stepHeaderStyle, subtitleStyle } from '../styles';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <header style={stepHeaderStyle}>
      <h1 style={displayStyle}>{title}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}
