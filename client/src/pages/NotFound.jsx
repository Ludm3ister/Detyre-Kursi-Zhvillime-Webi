import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="container notfound">
    <div>
      <h1>404</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: "1.25rem" }}>
        This page wandered off. Let's get you back.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
