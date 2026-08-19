import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";

function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <InstallPrompt />
    </div>
  );
}

export default Layout;