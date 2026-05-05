function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;