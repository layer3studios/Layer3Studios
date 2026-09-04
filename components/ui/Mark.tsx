import { MARK_PATH, MARK_VIEWBOX } from "@/brand/mark";

/**
 * The L3 mark, inline.
 *
 * Traced from the studio's logo into a single path and drawn in
 * currentColor, so it is ink on paper and vellum on ink with no second
 * asset. Size it with a class (`size-5`, `size-8`); it is square.
 */
export default function Mark({ className = "size-5", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path fill="currentColor" fillRule="evenodd" d={MARK_PATH} />
    </svg>
  );
}
