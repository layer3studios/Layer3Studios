"use client";

import { motion } from "framer-motion";
import { dependencyMap, severity } from "@/brand";

/**
 * The dependency tree as a small constellation.
 *
 * Nodes sit on different translateZ planes, so when the card tilts they
 * parallax against each other and the graph reads as having depth rather than
 * being a flat diagram. The two nodes with published advisories are lit in
 * critical red and pulse; everything else stays inert.
 *
 * Edges are drawn in SVG on the base plane. They intentionally do not
 * parallax — a flat substrate makes the raised nodes read as raised.
 */
export default function DependencyOrbit() {
  const { nodes, edges } = dependencyMap;

  return (
    <div className="layer relative mt-6 h-[190px] w-full">
      {/* Edges, flat on the base plane. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map(([a, b]) => {
          const from = nodes[a];
          const to = nodes[b];
          const risky = from.vulnerable || to.vulnerable;
          return (
            <line
              key={`${a}-${b}`}
              x1={from.x * 100}
              y1={from.y * 100}
              x2={to.x * 100}
              y2={to.y * 100}
              stroke={risky ? severity.critical : "#1F1F1F"}
              strokeOpacity={risky ? 0.4 : 1}
              strokeWidth={0.4}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Nodes, each lifted onto its own Z plane. */}
      {nodes.map((node) => (
        <motion.span
          key={node.id}
          className="layer absolute rounded-full"
          style={{
            left: `${node.x * 100}%`,
            top: `${node.y * 100}%`,
            width: node.size,
            height: node.size,
            marginLeft: -node.size / 2,
            marginTop: -node.size / 2,
            transform: `translateZ(${node.depth * 16}px)`,
            background: node.vulnerable ? severity.critical : "#333333",
            boxShadow: node.vulnerable
              ? `0 0 14px ${severity.critical}`
              : undefined,
          }}
          animate={
            node.vulnerable
              ? { opacity: [1, 0.42, 1], scale: [1, 1.22, 1] }
              : undefined
          }
          transition={
            node.vulnerable
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      ))}

      <p
        className="layer absolute bottom-0 left-0 font-mono text-[0.6875rem]"
        style={{ color: severity.critical, transform: "translateZ(40px)" }}
      >
        {dependencyMap.finding}
      </p>
    </div>
  );
}
