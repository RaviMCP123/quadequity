import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DynamicPage from './pages/DynamicPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DynamicPage />} />
        <Route path="about" element={<Navigate to="/about-us" replace />} />
        <Route path=":slug" element={<DynamicPage />} />
      </Route>
    </Routes>
  );
}
