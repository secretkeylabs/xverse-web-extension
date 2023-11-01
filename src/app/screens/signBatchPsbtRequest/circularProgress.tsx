interface Props {
  size: number;
  strokeWidth: number;
  percentage: number;
}

function CircularProgress({ size, percentage, strokeWidth }: Props) {
  const RADIUS = size / 2 - strokeWidth * 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={RADIUS}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="white"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={RADIUS}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={(1 - percentage / 100) * CIRCUMFERENCE}
        // eslint-disable-next-line no-inline-styles/no-inline-styles
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
    </svg>
  );
}

export default CircularProgress;
