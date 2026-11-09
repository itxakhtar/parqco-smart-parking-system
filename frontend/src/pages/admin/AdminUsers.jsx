import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Loading } from '../../components/Feedback.jsx';
import { errorMessage } from '../../utils/format.js';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/users').then((r) => setUsers(r.data.users)).catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!users) return <Loading />;

  const columns = [
    { header: 'Name', render: (u) => <strong>{u.name}</strong> },
    { header: 'Email', render: (u) => u.email },
    { header: 'Phone', render: (u) => u.phone || '–' },
    { header: 'Role', render: (u) => <span className={`pill pill--${u.role}`}>{u.role}</span> },
    { header: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString('en-GB') },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle={`${users.length} registered accounts.`} />
      <DataTable columns={columns} rows={users} />
    </>
  );
}
