import { Variants, Transition } from "framer-motion";

// コンテナアニメーション
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

// 左からスライドイン
export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 90
    }
  }
};

// 右からスライドイン
export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 90
    }
  }
};

// ボタンアニメーション
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

// 白いボタンアニメーション
export const whiteButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

// カードアニメーション
export const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      delay: 0.5,
      type: "spring",
      damping: 12,
      stiffness: 100
    }
  },
  hover: {
    y: -5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transition: {
      type: "spring", 
      stiffness: 300, 
      damping: 10
    }
  }
};

// カードの表示トランジション
const cardVisibleTransition: Transition = {
  delay: 0.5,
  type: "spring",
  damping: 12,
  stiffness: 100
};

// 順番に現れるカードのバリアント作成関数
export const createSequentialCardVariant = (delay: number): Variants => {
  return {
    ...cardVariants,
    visible: {
      ...cardVariants.visible,
      transition: {
        ...cardVisibleTransition,
        delay
      }
    }
  };
}; 