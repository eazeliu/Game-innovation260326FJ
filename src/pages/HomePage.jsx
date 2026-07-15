import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Game Innovation</h1>
      <p>請開啟以下頁面：</p>
      <Link className="home-link" to="/grid-anchor">
        前往 Grid Anchor
      </Link>
    </div>
  );
}
