import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";
import Aurora from "../components/Aurora";

function Layout({ children }) {
  return (
    <div className="app">
      <div className="app-aurora-bg">
        <Aurora colorStops={["#21e6b0", "#08080d", "#ffb020"]} amplitude={1.0} blend={0.6} speed={0.5} />
      </div>

      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <InstallPrompt />
    </div>
  );
}

export default Layout;