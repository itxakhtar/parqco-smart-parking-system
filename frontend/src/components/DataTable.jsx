import { EmptyState } from './Feedback.jsx';

/**
 * Small reusable table.
 * columns: [{ header: 'Name', render: (row) => row.name }]
 */
export default function DataTable({ columns, rows, emptyTitle = 'Nothing to show yet', rowKey = '_id' }) {
  if (!rows.length) return <EmptyState title={emptyTitle} />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>{columns.map((column) => <th key={column.header}>{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((column) => <td key={column.header} data-label={column.header}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
