import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

const PENDING = "Backend integration pending";

function UserTable({ users }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td><StatusBadge status={user.status} /></td>
              <td>{user.createdAt}</td>
              <td>
                <span className="row-actions">
                  <Button size="sm" variant="secondary" disabled title={PENDING}>View</Button>
                  <Button size="sm" variant="secondary" disabled title={PENDING}>Edit</Button>
                  <Button size="sm" variant="secondary" disabled title={PENDING}>
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
