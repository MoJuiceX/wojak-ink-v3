/**
 * Generator Preview
 *
 * Layer composition animation showing how the avatar
 * generator works.
 */

import { motion } from 'framer-motion';

const LAYERS = [
  { name: 'Background', icon: '🌄', delay: 0 },
  { name: 'Base Character', icon: '👤', delay: 0.1 },
  { name: 'Expression', icon: '😀', delay: 0.2 },
  { name: 'Accessories', icon: '🎩', delay: 0.3 },
];

export const GeneratorPreview = () => {
  return (
    <div className="generator-preview">
      {/* Layer stack visualization */}
      <div className="layer-stack">
        {[1, 2, 3].map((layer, index) => (
          <motion.div
            key={layer}
            className="layer-item"
            style={{
              zIndex: 3 - index,
              transform: `translateX(${index * 8}px) translateY(${index * 8}px)`,
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1 - index * 0.2, x: index * 8 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <img
              src={`/assets/gallery-previews/${
                ['wojak', 'soyjak', 'baddie'][index]
              }.png`}
              alt=""
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {/* Layer labels */}
      <div className="layer-labels">
        {LAYERS.map((layer) => (
          <motion.div
            key={layer.name}
            className="layer-label"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: layer.delay + 0.3, duration: 0.3 }}
            viewport={{ once: true }}
          >
            <span className="layer-label-icon">{layer.icon}</span>
            {layer.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GeneratorPreview;
