import { memo, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Card } from "../components/ui";

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        const result = await login(username.trim(), password);
        if (!result.ok) {
          setError(result.message);
          return;
        }
      } finally {
        setSubmitting(false);
      }
    },
    [login, username, password]
  );

  if (isAuthenticated && user) {
    if (user.mustChangePassword) {
      return <Navigate to="/account/password" replace state={{ from: location }} />;
    }
    const redirect = user.role === "super_admin" ? "/admin" : "/";
    return <Navigate to={from === "/login" ? redirect : from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-text-heading">
            Edenecart Order Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Sign in to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            autoComplete="username"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-text-muted">
          Use the account created by your admin. First-time staff: use the temporary password, then change it when prompted.
        </p>
      </Card>
    </div>
  );
}

export default memo(LoginPage);
