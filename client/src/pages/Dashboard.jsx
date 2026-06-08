import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../api/tasksApiSlice";
import { useGetUsersQuery } from "../api/authApiSlice";
import TaskForm from "../components/TaskForm.jsx";
import TaskItem from "../components/TaskItem.jsx";
import { isAdminRole } from "../utils/roles";

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = isAdminRole(userInfo?.role);

  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  // Full user list (admins only) so the owner filter can list every user,
  // including those without any tasks.
  const { data: users = [] } = useGetUsersQuery(undefined, { skip: !isAdmin });
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const submitting = creating || updating;

  const handleSubmit = async (form) => {
    setActionError("");
    try {
      if (editing) {
        await updateTask({ id: editing._id, ...form }).unwrap();
        setEditing(null);
      } else {
        await createTask(form).unwrap();
      }
    } catch (err) {
      setActionError(err?.data?.message || "Could not save the task.");
    }
  };

  const handleStatusChange = async (task, status) => {
    setActionError("");
    try {
      await updateTask({ id: task._id, status }).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || "Could not update status.");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setActionError("");
    try {
      await deleteTask(task._id).unwrap();
      if (editing?._id === task._id) setEditing(null);
    } catch (err) {
      setActionError(err?.data?.message || "Could not delete the task.");
    }
  };

  // Every user (admins can filter tasks by a specific user, even users
  // who currently have no tasks).
  const owners = useMemo(
    () =>
      users.map((u) => ({ id: u._id, name: u.name || u.email || "Unknown" })),
    [users]
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesOwner =
        !isAdmin ||
        ownerFilter === "all" ||
        (ownerFilter === "mine" && t.owner?._id === userInfo._id) ||
        t.owner?._id === ownerFilter;
      return matchesStatus && matchesSearch && matchesOwner;
    });
  }, [tasks, statusFilter, search, ownerFilter, isAdmin, userInfo]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      progress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  const errorMessage =
    actionError || (error && (error.data?.message || "Could not load tasks."));

  return (
    <div className="container page">
      <header className="page-head">
        <div>
          <div className="eyebrow">{isAdmin ? "All tasks" : "Your workspace"}</div>
          <h1>Hello, {userInfo?.name?.split(" ")[0]} 👋</h1>
          <p>
            {isAdmin
              ? "As an admin you can see and manage every user's tasks."
              : "Create, track and complete your tasks below."}
          </p>
        </div>
      </header>

      <section className="stats">
        <div className="card stat">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="card stat">
          <div className="num">{stats.todo}</div>
          <div className="lbl">To do</div>
        </div>
        <div className="card stat">
          <div className="num">{stats.progress}</div>
          <div className="lbl">In progress</div>
        </div>
        <div className="card stat">
          <div className="num">{stats.done}</div>
          <div className="lbl">Done</div>
        </div>
      </section>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <div className="dash-grid">
        <aside className="card form-panel">
          <h3>{editing ? "Edit task" : "New task"}</h3>
          <TaskForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        </aside>

        <section>
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
            {isAdmin && (
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
              >
                <option value="all">All users</option>
                <option value="mine">Only my tasks</option>
                {owners
                  .filter((o) => o.id !== userInfo._id)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner" />
              Loading tasks…
            </div>
          ) : filtered.length === 0 ? (
            <div className="card empty">
              <div className="big">No tasks here yet</div>
              <p>
                {tasks.length === 0
                  ? "Add your first task using the form on the left."
                  : "No tasks match your filters."}
              </p>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
