'use client'
import { useEffect } from "react";
import Image from "next/image";

 
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()
  useEffect(() => {
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    
    const toggleMenu = () => {
      menu.classList.toggle('hidden');
    };

    if (menuBtn && menu) {
      menuBtn.addEventListener('click', toggleMenu);
    }

    // Очистка события на размонтировании
    return () => {
      if (menuBtn) {
        menuBtn.removeEventListener('click', toggleMenu);
      }
    };
  }, []);
  const isActive = (path) => window.location.pathname === path ? 'text-yellow-500' : 'text-gray-700';

  
  return (
    <nav className="bg-white border-b border-gray-200 shadow-md p-[7px] sticky top-0 z-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[auto]">
    <div className="flex justify-between items-center">
      <a  href="/" className="flex items-center text-[25px] gap-[20px] flex-wrap font-bold text-yellow-400">
       
     
        <Image src="/assets/logo.png" alt="Logo" width={80} height={10} />
        <div>
          <p>Lyceum №3</p>
          <p className="text-[15px]">For Gifted Children</p>
        </div>
     
      </a>
      <div className="hidden md:flex space-x-8 relative">
        <a
          href="/"
          className={`relative group ${isActive('/')}`}
        >
          Главная
          <div className="absolute left-0 -bottom-1 w-full h-[2px] bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </a>
        <a
          href="/news"
          className={`relative group ${isActive('/news')}`}
        >
          Новости
          <div className="absolute left-0 -bottom-1 w-full h-[2px] bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </a>
        <a
          href="/ClassesList"
          className={`relative group ${isActive('/ClassesList')}`}
        >
          Классы
          <div className="absolute left-0 -bottom-1 w-full h-[2px] bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </a>
        <a
          href="/contact"
          className={`relative group ${isActive('/contact')}`}
        >
          Связь
          <div className="absolute left-0 -bottom-1 w-full h-[2px] bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </a>
      </div>
      <div className="md:hidden flex items-center">
        <button
          id="menu-btn"
          className="text-gray-700 hover:text-blue-500 focus:outline-none group relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6 group-hover:text-yellow-400 transition-colors duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-400 rounded-full transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
        </button>
      </div>
    </div>
  </div>

  <div id="menu" className="hidden md:hidden bg-white border-t border-gray-200">
    <a
      href="/"
      className={`block px-4 py-2 text-gray-700 hover:bg-yellow-400 hover:text-white transition-all duration-300 ${isActive('/')}`}
    >
      Главная
    </a>
    <a
      href="/news"
      className={`block px-4 py-2 text-gray-700 hover:bg-yellow-400 hover:text-white transition-all duration-300 ${isActive('/news')}`}
    >
      Новости
    </a>
    <a
      href="/ClassesList"
      className={`block px-4 py-2 text-gray-700 hover:bg-yellow-400 hover:text-white transition-all duration-300 ${isActive('/ClassesList')}`}
    >
      Классы
    </a>
    <a
      href="/contact"
      className={`block px-4 py-2 text-gray-700 hover:bg-yellow-400 hover:text-white transition-all duration-300 ${isActive('/contact')}`}
    >
      Связь
    </a>
  </div>
</nav>

  );
}
