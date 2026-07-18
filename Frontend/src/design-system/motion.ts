import type { Transition, Variants } from "framer-motion"

export const duration = {
  micro: 0.08,
  fast: 0.12,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
  glacial: 1.0,
}

export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
}

export const transitions = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  } satisfies Transition,
  elastic: {
    type: "spring" as const,
    stiffness: 200,
    damping: 15,
    mass: 1,
  } satisfies Transition,
  morph: {
    type: "spring" as const,
    stiffness: 250,
    damping: 22,
    mass: 0.8,
  } satisfies Transition,
  smooth: {
    type: "tween" as const,
    duration: duration.normal,
    ease: easing.entrance,
  } satisfies Transition,
  fast: {
    type: "tween" as const,
    duration: duration.fast,
    ease: "easeOut",
  } satisfies Transition,
  slow: {
    type: "tween" as const,
    duration: duration.slow,
    ease: easing.entrance,
  } satisfies Transition,
}

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.smooth },
    exit: { opacity: 0, transition: transitions.fast },
  } satisfies Variants,
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: transitions.smooth },
    exit: { opacity: 0, y: -8, transition: transitions.fast },
  } satisfies Variants,
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: transitions.spring },
    exit: { opacity: 0, scale: 0.95, transition: { duration: duration.fast } },
  } satisfies Variants,
  slideInLeft: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0, transition: transitions.spring },
    exit: { opacity: 0, x: -16, transition: transitions.fast },
  } satisfies Variants,
  slideInRight: {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: transitions.spring },
    exit: { opacity: 0, x: 16, transition: transitions.fast },
  } satisfies Variants,
  scalePress: {
    whileHover: { scale: 1.02, transition: transitions.fast },
    whileTap: { scale: 0.98, transition: { duration: duration.micro } },
  } satisfies Variants,
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  } satisfies Variants,
  staggerItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: transitions.smooth },
  } satisfies Variants,
} as const

// 2060 Futuristic Animation System
export const futuristic = {
  glowPulse: {
    animate: {
      boxShadow: [
        "0 0 4px rgba(0,191,165,0.3)",
        "0 0 12px rgba(0,191,165,0.5)",
        "0 0 20px rgba(0,191,165,0.2)",
        "0 0 12px rgba(0,191,165,0.5)",
        "0 0 4px rgba(0,191,165,0.3)",
      ],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  },
  neonGlow: {
    animate: {
      boxShadow: [
        "0 0 2px rgba(0,191,165,0.2), 0 0 4px rgba(0,191,165,0.1)",
        "0 0 8px rgba(0,191,165,0.4), 0 0 16px rgba(0,191,165,0.2)",
        "0 0 2px rgba(0,191,165,0.2), 0 0 4px rgba(0,191,165,0.1)",
      ],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  },
  morphBorder: {
    whileHover: {
      borderColor: ["rgba(0,191,165,0.3)", "rgba(0,191,165,0.8)", "#00BFA5", "rgba(0,191,165,0.3)"],
      transition: { duration: 1, ease: "easeInOut" },
    },
  },
  waveButton: {
    whileHover: {
      scale: 1.04,
      boxShadow: "0 0 25px rgba(0,191,165,0.35), 0 0 50px rgba(0,191,165,0.1)",
      transition: { type: "spring", stiffness: 400, damping: 8 },
    },
    whileTap: {
      scale: 0.96,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  },
  borderWave: {
    whileHover: {
      borderImage: "linear-gradient(135deg, #00BFA5, #00D68F, #00BFA5) 1",
      borderWidth: "1px",
      borderStyle: "solid",
      transition: { duration: 0.5 },
    },
  },
  pageEntrance: {
    initial: { opacity: 0, y: 30, scale: 0.97, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  slideGlide: {
    initial: { opacity: 0, x: -30, skewX: "-3deg" },
    animate: { opacity: 1, x: 0, skewX: "0deg", transition: { type: "spring", stiffness: 150, damping: 20 } },
  },
  cardHover: {
    whileHover: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 12px 40px rgba(0,191,165,0.2), 0 0 0 1px rgba(0,191,165,0.1)",
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  },
  staggerList: {
    animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
  },
  listItem: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 22 } },
  },
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    },
  },
  rotateIcon: {
    whileHover: { rotate: 360, scale: 1.1, transition: { duration: 0.6, ease: "easeInOut" } },
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
  },
  fadeSlideUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  countUp: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  },
  progressGlow: {
    animate: {
      background: [
        "linear-gradient(90deg, #00BFA5 0%, #00D68F 50%, #00BFA5 100%)",
        "linear-gradient(90deg, #00D68F 0%, #00BFA5 50%, #00D68F 100%)",
        "linear-gradient(90deg, #00BFA5 0%, #00D68F 50%, #00BFA5 100%)",
      ],
      backgroundSize: "200% 100%",
      backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  },
  notificationPulse: {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
}

export const motionPresets = {
  duration,
  easing,
  transitions,
  variants,
  futuristic,
} as const

export type MeterVerseMotion = typeof motionPresets
