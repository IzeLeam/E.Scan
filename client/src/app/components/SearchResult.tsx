"use client";

import Slider from "react-slick";
import { motion } from "framer-motion";

type Props = {
  data: {
    title: string;
    description: string;
    images: string[];
    offer: boolean;
    price: number;
    stock: number;
    rawData: string;
  };
};

export default function SearchResult({ data }: Props) {
  const sliderSettings = {
    dots: true,
    infinite: data?.images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(data.description);

  return (
    <motion.div
      className="w-full rounded min-h-[100vh] shadow-md overflow-hidden"
      style={{ backgroundColor: "#F0F8FF" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex shadow-md border-b-2 border-(--foreground) relative z-10"
      >
        <motion.h2
          className="text-xl text-(--background) font-semibold px-5 pt-5 pb-2 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {data.title}
        </motion.h2>
        <motion.div
          className="flex flex-col items-center justify-center p-4"
        >
          {/* Icône Partage */}
          <button
            aria-label="Share"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15 6.75C15 5.50736 16.0074 4.5 17.25 4.5C18.4926 4.5 19.5 5.50736 19.5 6.75C19.5 7.99264 18.4926 9 17.25 9C16.0074 9 15 7.99264 15 6.75ZM17.25 3C15.1789 3 13.5 4.67893 13.5 6.75C13.5 7.00234 13.5249 7.24885 13.5724 7.48722L9.77578 9.78436C9.09337 8.85401 7.99222 8.25 6.75 8.25C4.67893 8.25 3 9.92893 3 12C3 14.0711 4.67893 15.75 6.75 15.75C8.10023 15.75 9.28379 15.0364 9.9441 13.9657L13.5866 16.4451C13.5299 16.7044 13.5 16.9737 13.5 17.25C13.5 19.3211 15.1789 21 17.25 21C19.3211 21 21 19.3211 21 17.25C21 15.1789 19.3211 13.5 17.25 13.5C15.9988 13.5 14.8907 14.1128 14.2095 15.0546L10.4661 12.5065C10.4884 12.3409 10.5 12.1718 10.5 12C10.5 11.7101 10.4671 11.4279 10.4049 11.1569L14.1647 8.88209C14.8415 9.85967 15.971 10.5 17.25 10.5C19.3211 10.5 21 8.82107 21 6.75C21 4.67893 19.3211 3 17.25 3ZM15 17.25C15 16.0074 16.0074 15 17.25 15C18.4926 15 19.5 16.0074 19.5 17.25C19.5 18.4926 18.4926 19.5 17.25 19.5C16.0074 19.5 15 18.4926 15 17.25ZM4.5 12C4.5 10.7574 5.50736 9.75 6.75 9.75C7.99264 9.75 9 10.7574 9 12C9 13.2426 7.99264 14.25 6.75 14.25C5.50736 14.25 4.5 13.2426 4.5 12Z" fill="currentColor"/>
            </svg>
          </button>

          {/* Icône Code-barres */}
          <button
            aria-label="Barcode"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v16M7 4v16M10 4v16M14 4v16M17 4v16M20 4v16" />
            </svg>
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className={`bg-white ${data?.images.length > 1 ? "mb-5" : "mb-0"} py-3 h-min-[100px]`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Slider {...sliderSettings}>
          {data.images.map((img, index) => (
            <div key={index}>
              <motion.img
                src={img}
                alt={`Image ${index + 1}`}
                className="mx-auto h-64 object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              />
            </div>
          ))}
        </Slider>
      </motion.div>

      <motion.div
        className="w-full bg-(--background) flex items-center justify-around py-3 px-5 shadow-lg"
        initial={{ scaleY: 0, y: -20 }}
        animate={{ scaleY: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        {data.offer || data.stock > 0 ? (
          <>
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-400 font-semibold">Prix:</h3>
              <span className="text-lg text-white">{data.price ?? "No price found"} €</span>
            </div>
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-400 font-semibold">Stock:</h3>
              <span className="text-lg text-white">
                {data.stock ?? "No stock information"}
              </span>
            </div>
          </>
        ) : (
          <div className="text-lg text-red-600 font-semibold">
            <h3 className="inline-block text-black mr-3">Non disponible en magasin</h3>
          </div>
        )}
      </motion.div>

      <motion.details
        className="pl-5 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        open={true}
      >
        <summary className="text-lg text-gray-900 font-semibold cursor-pointer">
          Description
        </summary>
        <motion.div
          className="mt-2 px-3 text-sm text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <p>{data.description}</p>
          )}
        </motion.div>
      </motion.details>
      
      {/* Raw Data Section for debugging
      <motion.details
        className="pl-5 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <summary className="text-lg text-gray-900 font-semibold cursor-pointer">
          Raw Data
        </summary>
        <motion.pre
          className="text-sm pl-3 text-gray-800 whitespace-pre-wrap mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {typeof data.rawData === "string"
            ? (() => {
                try {
                  return JSON.stringify(JSON.parse(data.rawData), null, 2);
                } catch {
                  return data.rawData;
                }
              })()
            : JSON.stringify(data.rawData, null, 2)}
        </motion.pre>
      </motion.details>
      */}
    </motion.div>
  );
}
