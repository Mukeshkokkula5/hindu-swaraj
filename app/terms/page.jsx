import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Terms & Conditions | Hindu Swaraj Youth Welfare Association",
  description:
    "Terms and Conditions for Hindu Swaraj Youth Welfare Association Jagtial (Regd. No. 784/2025).",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#fbf9f6", color: "#1B130E", padding: "120px 20px 60px 20px" }}>
        <div style={{ maxWidth: "840px", margin: "0 auto", background: "#ffffff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "1px solid #f1f5f9", paddingBottom: "24px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#d97706", textTransform: "uppercase", letterSpacing: "1px" }}>
              Official Society Charter
            </span>
            <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#800A0D", marginTop: "6px" }}>
              Terms &amp; Conditions
            </h1>
            <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "6px" }}>
              Hindu Swaraj Youth Welfare Association &bull; Regd. No. 784/2025 &bull; Jagtial, Telangana
            </p>
          </div>

          <div style={{ lineHeight: "1.8", fontSize: "0.95rem", color: "#334155", display: "flex", flexDirection: "column", gap: "20px" }}>
            <section>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By downloading, accessing, or using the <b>Hindu Swaraj</b> mobile application or website (hinduswarajyouth.online), you agree to comply with and be bound by these Terms and Conditions and the bylaws of the Hindu Swaraj Youth Welfare Association.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                2. Membership &amp; Monthly Subscriptions
              </h2>
              <p>
                Registered members agree to pay the mandatory monthly subscription of ₹216 (or ₹116 concession for recognized volunteers) on or before the 10th of every month. Subscriptions fund Youth Development (50%), Emergency Relief &amp; Medical Seva (30%), and Public Seva (20%).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                3. Voluntary Donations
              </h2>
              <p>
                All donations and contributions made towards Vinayaka Navaratri Seva, Annadanam, and Blood Camps are strictly voluntary. Official numbered receipts with digital verification QR codes are issued for all contributions.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                4. Code of Conduct
              </h2>
              <p>
                Members and volunteers must adhere to the high ideals of national service, mutual respect, and community welfare represented by Lokmanya Bal Gangadhar Tilak and Chhatrapati Shivaji Maharaj. Any misuse of digital ID cards or false emergency requests will result in disciplinary action and membership revocation.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                5. Jurisdiction
              </h2>
              <p>
                Any legal disputes or claims arising out of the association activities, website, or mobile application are subject to the exclusive jurisdiction of the civil courts in Jagtial, Telangana.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
