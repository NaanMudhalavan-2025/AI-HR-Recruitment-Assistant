export default function FilePanel({ tab, children, className = "" }) {
  return (
    <div className={`file-panel px-5 pt-6 pb-5 ${className}`}>
      {tab && <div className="file-tab">{tab}</div>}
      {children}
    </div>
  );
}
