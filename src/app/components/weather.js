'use client'
import { useEffect } from "react";
const Weather = ()=>{
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//nuipogoda.ru/informer/nuipogoda.js";
        script.async = true;
        document.body.appendChild(script);
    
        return () => {
          document.body.removeChild(script); // Чистим скрипт при размонтировании компонента
        };
      }, []);
    return (
        <a
          className="nuipogoda-iframe-informer"
          data-nuipogoda="informer2"
          href="https://nuipogoda.ru"
          style={{
            width: "284px",
            height: "300px",
            display: "block",
            boxShadow: "0 0 5px #999",
          }}
        >
          
        </a>
    )
}
export default Weather;