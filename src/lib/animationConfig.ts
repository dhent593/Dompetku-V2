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
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

export const snappyBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

