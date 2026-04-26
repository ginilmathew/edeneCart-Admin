import { 
  Card, 
  CardHeader, 
  Badge 
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

function VendorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-slate-500">Welcome Back</p>
            <h2 className="text-2xl font-bold mt-1">{user?.name}</h2>
            <div className="mt-4">
              <Badge variant="success">Active Vendor</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Marketplace Overview"
          subtitle="Quick access to your vendor tools"
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-surface hover:border-primary transition-colors cursor-pointer group" onClick={() => window.location.href='/vendor/products'}>
            <p className="text-xs font-semibold text-text-muted uppercase">My Catalog</p>
            <p className="text-xl font-bold mt-1 group-hover:text-primary">Manage Products</p>
          </div>
          <div className="p-4 rounded-xl border bg-surface hover:border-primary transition-colors cursor-pointer group" onClick={() => window.location.href='/vendor/orders'}>
            <p className="text-xs font-semibold text-text-muted uppercase">Recent Orders</p>
            <p className="text-xl font-bold mt-1 group-hover:text-primary">View Product Orders</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VendorDashboardPage;
