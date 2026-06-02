import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetUsersQuery, useDeleteUserMutation } from "../api/authApiSlice";

const Admin = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [actionError, setActionError] = useState("");

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete user "${target.name}"?`)) return;
    setActionError("");
    try {
      await deleteUser(target._id).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || "Could not delete user.");
    }
  };

  const errorMessage =
    actionError || (error && (error.data?.message || "Could not load users."));

  return (
    <div className="container page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Admin panel</div>
          <h1>User management</h1>
          <p>Everyone with an account in the system.</p>
        </div>
      </header>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      {isLoading ? (
        <div className="loading">
          <div className="spinner" />
          Loading users…
        </div>
      ) : (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="name">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="pill pill-role">{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right" }}>
                    {u._id === userInfo._id ? (
                      <span style={{ color: "var(--ink-faint)", fontSize: "0.8rem" }}>
                        You
                      </span>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
