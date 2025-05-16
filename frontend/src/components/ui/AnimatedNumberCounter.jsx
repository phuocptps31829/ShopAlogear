import { useEffect } from "react";
import { useSpring, useMotionValue, useTransform, motion } from "framer-motion";
import PropTypes from "prop-types";

export default function AnimatedValue({ value, isCurrency }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    bounce: 0,
    duration: 1000,
  });
  const roundedValue = useTransform(springValue, (latest) =>
    isCurrency
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Math.floor(latest))
      : Math.floor(latest),
  );

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.div className="font-semibold">{roundedValue}</motion.div>;
}

AnimatedValue.propTypes = {
  value: PropTypes.number.isRequired,
  isCurrency: PropTypes.bool,
};