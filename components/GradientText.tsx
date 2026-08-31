export default function GradientText({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <span className={`text-gradient-vivid ${className}`}>{children}</span>;
}
