const Citate = ()=>{
    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center space-y-4">
            <img
              src="./user.png" // Замените на ссылку к изображению директора
              alt="Директор школы"
              className="w-32 h-32 rounded-full object-cover"
            />
            <p className="text-lg italic text-gray-700 text-center font-serif">
              "Образование — это ключ к успеху, а наша школа — это место, где ваши
              мечты становятся реальностью."
            </p>
            <p className="text-sm text-gray-500 font-bold text-center">
              — Кувватова Рафоат Ашуровна, Директор школы
            </p>
          </div>
    )
}
export default Citate;