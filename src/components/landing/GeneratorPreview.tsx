/**
 * Generator Preview
 *
 * Shows the 7 correct metadata attributes with layer visualization.
 */

import { motion } from 'framer-motion';

const ATTRIBUTES = [
  { name: 'Background', count: 45, icon: '🌄' },
  { name: 'Base', count: 14, icon: '👤' },
  { name: 'Clothes', count: 36, icon: '👕' },
  { name: 'Face', count: 6, icon: '😶' },
  { name: 'Mouth', count: 20, icon: '👄' },
  { name: 'Face Wear', count: 18, icon: '👓' },
  { name: 'Head', count: 40, icon: '👑' },
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

      {/* Attribute pills */}
      <div className="attribute-pills">
        {ATTRIBUTES.map((attr, index) => (
          <motion.div
            key={attr.name}
            className="attribute-pill"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <span className="attribute-icon">{attr.icon}</span>
            <span className="attribute-name">{attr.name}</span>
            <span className="attribute-count">{attr.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GeneratorPreview;
