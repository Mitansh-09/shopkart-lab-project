import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // /customers/me is the source of truth for "am I logged in". We never
    // store the logged-in user ourselves, because the cookie is HttpOnly:
    // JavaScript can't read it, so the server is the only one who can
    // confirm it's valid. A failed request here means no valid cookie,
    // so this doubles as the route guard for this page.
    api
      .get("/customers/me")
      .then((res) => {
        if (isMounted) setCustomer(res.data);
      })
      .catch(() => {
        if (isMounted) navigate("/login", { replace: true });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="home-screen">
      <Navbar />
      <main className="home-content">
        <h1>Welcome, {customer.fullName}</h1>
        <p className="home-subtext">Here's what we have on profile for you.</p>

        <div className="profile-card">
          <div className="profile-row">
            <span className="profile-label">Name</span>
            <span className="profile-value">{customer.fullName}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{customer.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Phone</span>
            <span className="profile-value">{customer.phone}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
