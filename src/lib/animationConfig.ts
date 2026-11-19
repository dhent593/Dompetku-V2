export const snappyGelVariants = {
  initial: { opacity: 0, scale: 0.94, y: 14 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1], // Ultra-smooth hardware-accelerated cubic bezier
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    pointerEvents: 'none' as const,
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  },
};

export const snappyBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: {
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: { duration: 0.08, ease: 'easeIn' },
  },
};

export const snappyBottomSheetVariants = {
  initial: { opacity: 0, y: '100%' },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    pointerEvents: 'none' as const,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
  },
};

