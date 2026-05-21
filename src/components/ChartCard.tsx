interface Props {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, action, className }: Props) {
  return (
    <div className={`card-hover p-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default ChartCard;