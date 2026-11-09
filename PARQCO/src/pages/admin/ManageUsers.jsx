import Card from "../../components/common/Card";
import UserTable from "../../components/admin/UserTable";
import { mockUsers } from "../../data/mockData";

function ManageUsers() {
  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p className="muted">Development data. Actions are disabled: backend integration pending.</p>
      </div>
      <Card><UserTable users={mockUsers} /></Card>
    </div>
  );
}

export default ManageUsers;
