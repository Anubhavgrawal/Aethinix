import { useAuth } from "../../context/AuthContext";
import "./Account.css";

const Account = () => {
  const { user } = useAuth();

  return (
    <div className="account-page">
      <div className="account-container">
        <header className="account-header">
          <p>ACCOUNT</p>
          <h1>ACCOUNT SETTINGS</h1>
          <span>Manage your AETHENIX account information.</span>
        </header>

        <section className="account-card">
          <div className="account-card-header">
            <div>
              <p>PROFILE INFORMATION</p>
              <h2>PERSONAL DETAILS</h2>
            </div>

            <span className="account-status">ACTIVE</span>
          </div>

          <div className="account-fields">
            <div className="account-field">
              <span>FULL NAME</span>
              <strong>{user?.name || "—"}</strong>
            </div>

            <div className="account-field">
              <span>EMAIL ADDRESS</span>
              <strong>{user?.email || "—"}</strong>
            </div>

            <div className="account-field">
              <span>ACCOUNT ROLE</span>
              <strong>{user?.role || "ATHLETE"}</strong>
            </div>

            <div className="account-field">
              <span>PLAYER ID</span>
              <strong>AX-00001</strong>
            </div>
          </div>
        </section>

        <section className="account-security">
          <div>
            <p>SECURITY</p>
            <h2>ACCOUNT SECURITY</h2>
            <span>
              Password and security controls will be available here.
            </span>
          </div>

          <button type="button" disabled>
            Change Password
          </button>
        </section>
      </div>
    </div>
  );
};

export default Account;