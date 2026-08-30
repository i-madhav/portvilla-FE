import { Link } from 'react-router-dom';

export function Brand() {
  return (
    <Link
      to="/"
      aria-label="Portvilla home"
      className="pv-focusable inline-flex items-center rounded-pill text-ink no-underline"
    >
      <span className="text-base font-bold tracking-tight">portvilla</span>
    </Link>
  );
}
