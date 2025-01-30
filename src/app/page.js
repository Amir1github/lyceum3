'use client';
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Weather from "./components/weather";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Schedule from "./components/Schedule";
import Citate from "./components/Citate";
import Calendar from "./components/Calendar";
import Link from "next/link";

const Main = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminPassword = localStorage.getItem('AdminPas');
        const response = await fetch('/api/checkAdmin', {
          headers: { 'x-admin-password': adminPassword },
        });
  
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Ошибка проверки администратора:', error);
      }
    };
    checkAdmin();

    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* История */}
        <section className="py-8">
          <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">История</h2>
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start md:space-x-8">
            <p className="text-[20px] leading-relaxed text-justify w-full md:w-1/2">
              На момент 30 августа 2019 года Президент Таджикистана Эмомали Рахмон и председатель города Душанбе приняли участие в сдаче в эксплуатацию нового современного здания лицея №3 для одаренных детей, где созданы современные условия для получения знаний подрастающими поколениями, на которых в дальнейшем будет возложено будущее нации.
            </p>
            <img
              className="w-full md:w-1/2 rounded-lg shadow-lg mb-6 md:mb-0 transform transition-transform duration-300 ease-in-out hover:scale-105"
              src="/assets/front-view.jpg"
              alt="Фронтальный вид школы"
            />
          </div>
        </section>

        {/* Слайдер новостей */}
        <section className="py-8">
          <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">Жизнь школы</h2>
          {loading ? (
            <div className='loader'>

            </div>
          ) : news.length > 0 ? (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
              >
                {news.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div className="border rounded-lg p-4 shadow-md bg-white">
                      <Link href={`/news/${item.id}`} passHref>
                        <div className="cursor-pointer">
                          <h2 className="text-lg font-semibold mb-2 truncate">{item.title}</h2>
                          <p className="text-gray-600 mb-4 truncate">{item.content}</p>
                          <div className="grid grid-cols-2 gap-2 overflow-hidden">
                            {item.images &&
                              item.images.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={img}
                                    alt={`Новость ${item.id} - изображение ${idx + 1}`}
                                    className="w-full h-28 object-cover rounded-lg border"
                                  />
                                </div>
                              ))}
                          </div>
                          <p className="text-gray-500 text-sm mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      </Link>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="text-center mt-6">
                <Link href="/news">
                  <button className="text-blue-500 text-decoration-underline px-6 py-2 rounded-lg transition">
                    Смотреть все новости
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Нет доступных новостей.</p>
          )}
        </section>

        {/* Почему мы? */}
        <section className="flex gap-[20px] items-start flex-wrap">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold mb-4">Почему мы?</h2>
            <ul className="list-disc list-inside space-y-2 text-[18px] leading-relaxed">
              <li>Опытные и увлеченные преподаватели</li>
              <li>Современные учебные помещения</li>
              <li>Инклюзивное и разнообразное сообщество</li>
              <li>Акцент на академическое совершенство и внешкольную деятельность</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-5 md:gap-5 w-full">
            <div className="w-full md:w-2/3 lg:w-3/4 flex-shrink-0">
              <Weather />
            </div>
            <div className="w-full sm:w-[75%] md:w-1/3 lg:w-1/4 flex-shrink-0 bg-white rounded-lg p-4 shadow-md mt-6 md:mt-0">
              <Calendar />
            </div>
          </div>
        </section>

        {/* Цитата директора и График работы */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Citate />
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <Schedule />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Main;
