export default function DocumentNotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Document Not Found</h1>
      <p>We couldn't find the document you were looking for.</p>
      <a href="/dashboard">Go back to Dashboard</a>
    </div>
  );
}