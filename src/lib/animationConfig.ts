export const snappyGelVariants = {
  initial: { opacity: 0, scale: 0.88, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 550,
      damping: 28,
      mass: 0.55,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 12,
    pointerEvents: 'none' as const,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

export const snappyBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: {
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: { duration: 0.1 },
  },
};

export const snappyBottomSheetVariants = {
  initial: { opacity: 0, y: '100%' },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 30,
      mass: 0.65,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    pointerEvents: 'none' as const,
    transition: { duration: 0.16, ease: [0.32, 0, 0.67, 0] },
  },
};

