import { useSelector } from "react-redux";
import { isAdminRole } from "../utils/roles";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

const TaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = isAdminRole(userInfo?.role);
  const due = formatDate(task.dueDate);

  return (
    <article className={`card task-item ${task.status === "done" ? "is-done" : ""}`}>
      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          <span className={`pill ${task.status}`}>{task.status.replace("-", " ")}</span>
          <span className={`pill ${task.priority}`}>{task.priority}</span>
          {due && (
            <>
              <span className="dot">•</span>
              <span>Due {due}</span>
            </>
          )}
          {isAdmin && task.owner?.name && (
            <>
              <span className="dot">•</span>
              <span>👤 {task.owner.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          title="Change status"
        >
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">
          ✎
        </button>
        <button
          className="icon-btn danger"
          onClick={() => onDelete(task)}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </article>
  );
};

export default TaskItem;
