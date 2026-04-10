import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

export const Animacion = ({ children }: Props) => {
  return (
    <motion.div
    className="w-fit"
      animate={{
        scale: [1, 1.1, 1], // Un 10% de crecimiento suele ser más sutil y profesional
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};