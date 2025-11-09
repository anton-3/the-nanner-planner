import { useEffect, useRef } from 'react';
import TwinklingStars from './TwinklingStars';
import ShootingStars from './ShootingStars';

/*
  SpaceBackground renders layered starfields + a subtle nebula gradient.
  - Layer 1: faint distant stars (slow drift)
  - Layer 2: medium stars (parallax)
  - Layer 3: bright near stars (twinkle)
  Uses pure CSS for performance; no canvas dependency yet (can upgrade later).
*/

export const SpaceBackground = () => {
  return (
    <div className="space-bg pointer-events-none fixed inset-0 -z-10">
      <div className="space-gradient" />
      <div className="stars stars-layer1" />
      <div className="stars stars-layer2" />
      <div className="stars stars-layer3" />
      <div className="space-vignette" />
      {/* High density dynamic star layer */}
      <TwinklingStars />
      {/* Occasional shooting stars with glowing tails */}
      <ShootingStars />
    </div>
  );
};

export default SpaceBackground;
