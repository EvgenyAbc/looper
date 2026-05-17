import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="not-found">
        <h1>404</h1>
        <p>This path is not available in the shell router.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  );
}
