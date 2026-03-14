import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function App() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statusRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/api/status`),
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/orders`),
      ]);

      const statusData = await statusRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setServices(statusData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runningCount = useMemo(
    () => services.filter((service) => service.status === "running").length,
    [services],
  );

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      const product = products.find((p) => p.name === order.product);
      if (!product) return sum;
      return sum + product.price * order.quantity;
    }, 0);
  }, [orders, products]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container py-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div>
              <h1 className="app-title mb-2">Microservices Dashboard</h1>
              <p className="app-subtitle mb-0">
                Simple single-page frontend for Gateway, Product Service, and
                Order Service.
              </p>
            </div>

            <button
              className="btn btn-primary px-4 py-2 fw-semibold"
              onClick={loadData}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <main className="container py-4 py-lg-5">
        {loading ? (
          <div className="card clean-card text-center p-5">
            <h4 className="mb-2">Loading dashboard...</h4>
            <p className="text-muted mb-0">
              Please wait while services are checked.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="summary-card">
                    <div className="summary-label">Running Services</div>
                    <div className="summary-value text-primary">
                      {runningCount}
                    </div>
                    <div className="summary-note">
                      Currently active microservices
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="summary-card">
                    <div className="summary-label">Total Products</div>
                    <div className="summary-value">{products.length}</div>
                    <div className="summary-note">
                      Hardcoded product records
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="summary-card">
                    <div className="summary-label">Estimated Revenue</div>
                    <div className="summary-value">${totalRevenue}</div>
                    <div className="summary-note">Based on current orders</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-4">
              <div className="clean-card p-4">
                <div className="section-header mb-3">
                  <div>
                    <h3 className="section-title mb-1">Service Status</h3>
                    <p className="section-text mb-0">
                      Live service health information from the API Gateway.
                    </p>
                  </div>
                </div>

                <div className="row g-3">
                  {services.map((service, index) => (
                    <div className="col-md-4" key={index}>
                      <div className="service-box">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="service-name mb-1 text-capitalize">
                              {service.name}
                            </h5>
                            <p className="service-port mb-0">
                              Port: {service.port || "N/A"}
                            </p>
                          </div>

                          <span
                            className={`status-badge ${
                              service.status === "running"
                                ? "status-running"
                                : "status-down"
                            }`}
                          >
                            {service.status === "running" ? "Running" : "Down"}
                          </span>
                        </div>

                        <div className="service-line"></div>

                        <small className="text-muted">
                          {service.status === "running"
                            ? "Service is reachable and responding normally."
                            : "Service is currently unavailable."}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="row g-4">
                <div className="col-xl-6">
                  <div className="clean-card p-4 h-100">
                    <div className="section-header mb-3">
                      <div>
                        <h3 className="section-title mb-1">Products</h3>
                        <p className="section-text mb-0">
                          Product data loaded through the gateway.
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table custom-table align-middle mb-0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th className="text-end">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id}>
                              <td>
                                <span className="mini-pill">#{product.id}</span>
                              </td>
                              <td className="fw-semibold">{product.name}</td>
                              <td>{product.category}</td>
                              <td className="text-end">${product.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-xl-6">
                  <div className="clean-card p-4 h-100">
                    <div className="section-header mb-3">
                      <div>
                        <h3 className="section-title mb-1">Orders</h3>
                        <p className="section-text mb-0">
                          Order data loaded from the order microservice.
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table custom-table align-middle mb-0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td>
                                <span className="mini-pill">#{order.id}</span>
                              </td>
                              <td className="fw-semibold">{order.customer}</td>
                              <td>{order.product}</td>
                              <td>{order.quantity}</td>
                              <td>
                                <span className="order-status">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
