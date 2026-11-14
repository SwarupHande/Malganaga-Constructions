// Full-screen loader: three bricks stack up and reset, in a loop. Pure CSS, no timers.
export default function Loader({ label = 'Loading' }) {
  return (
    <div className="login loader" role="status" aria-live="polite">
      <div className="loader__stack" aria-hidden="true">
        <span className="loader__brick" />
        <span className="loader__brick" />
        <span className="loader__brick" />
      </div>
      <p className="loader__text">{label}</p>
    </div>
  );
}
