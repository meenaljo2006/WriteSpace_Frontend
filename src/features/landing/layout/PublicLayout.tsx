import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#FFFBF5] dark:bg-[#0B192C] text-[#0B192C] dark:text-gray-100 font-sans transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}