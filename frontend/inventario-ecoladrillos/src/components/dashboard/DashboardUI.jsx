export function Card({ title, value, subtitle, icon, trend, color = "primary" }) {
  return (
    <div className={`dashboard-card dashboard-card--${color}`}>
      <div className="dashboard-card__header">
        {icon && <div className="dashboard-card__icon">{icon}</div>}
        <div className="dashboard-card__content">
          <h4 className="dashboard-card__title">{title}</h4>
          <p className="dashboard-card__value">{value}</p>
          {subtitle && <span className="dashboard-card__subtitle">{subtitle}</span>}
        </div>
        {trend && (
          <div className={`dashboard-card__trend dashboard-card__trend--${trend.type}`}>
            <span className="dashboard-card__trend-icon">
              {trend.type === 'up' ? '↗' : '↘'}
            </span>
            <span className="dashboard-card__trend-value">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCard({ title, stats, color = "primary" }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <h4 className="stat-card__title">{title}</h4>
      <div className="stat-card__stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card__item">
            <span className="stat-card__label">{stat.label}</span>
            <span className="stat-card__value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricGrid({ title, metrics }) {
  return (
    <div className="metric-grid">
      <h3 className="metric-grid__title">{title}</h3>
      <div className="metric-grid__items">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <div className="metric-item__icon" style={{backgroundColor: metric.color}}>
              {metric.icon}
            </div>
            <div className="metric-item__content">
              <span className="metric-item__label">{metric.label}</span>
              <span className="metric-item__value">{metric.value}</span>
              {metric.change && (
                <span className={`metric-item__change metric-item__change--${metric.change.type}`}>
                  {metric.change.type === 'positive' ? '+' : ''}{metric.change.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Table({ data, columns, title }) {
  return (
    <div className="dashboard-table-container">
      {title && <h3 className="dashboard-table__title">{title}</h3>}
      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.accessor ? row[col.accessor] : col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AlertCard({ alerts, type = "warning" }) {
  if (!alerts || alerts.length === 0) return null;
  
  return (
    <div className={`alert-card alert-card--${type}`}>
      <div className="alert-card__header">
        <span className="alert-card__icon">⚠</span>
        <h4 className="alert-card__title">Alertas del Sistema</h4>
      </div>
      <div className="alert-card__content">
        {alerts.map((alert, index) => (
          <div key={index} className="alert-card__item">
            <span className="alert-card__message">{alert}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
