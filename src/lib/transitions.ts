export const SLIDE_TRANSITION_MS = 450;

const SLIDE_DISTANCE_PX = 16;

export const slideOut = {
  y: -SLIDE_DISTANCE_PX,
  duration: SLIDE_TRANSITION_MS,
};

/* Delayed by the outgoing duration, so the new content only slides in
   once the old content has fully slid out. */
export const slideIn = {
  y: SLIDE_DISTANCE_PX,
  duration: SLIDE_TRANSITION_MS,
  delay: SLIDE_TRANSITION_MS,
};
