import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

export default function TiltImage({ src, alt = "", className = "", imgClassName = "", parallax = false, eager = false }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 120, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    ref.current.style.setProperty("--spot", `${x * 100}% ${y * 100}%`);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ perspective: 1200, y: parallax ? parallaxY : 0 }}
      className={`tilt-spot relative overflow-hidden ${className}`}
      data-testid="tilt-image"
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="h-full w-full">
        <img src={src} alt={alt} className={`h-full w-full object-cover object-center ${imgClassName}`} loading={eager ? "eager" : "lazy"} />
        <div className="spotlight" />
      </motion.div>
    </motion.div>
  );
}
