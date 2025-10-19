"use client";

import Slider from "react-slick";
import { motion } from "framer-motion";
import { useNotification } from "./notifications/NotificationProvider";

type Props = {
  data: {
    title: string;
    description: string;
    images: string[];
    offer: boolean;
    price: number;
    stock: number;
    rawData: string;
    ean: string;
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

  const { notify } = useNotification();

  return (
    <motion.div
      className="w-full min-h-[100vh] overflow-hidden"
      style={{ 
        background: "linear-gradient(to bottom, #F0F8FF 0%, #E8F4F8 100%)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="px-6 py-5 flex items-start justify-between">
          <motion.h2
            className="text-xl text-(--background) font-bold flex-1 leading-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {data.title}
          </motion.h2>
          <motion.div
            className="flex gap-2 ml-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              aria-label="Partager"
              className="p-2.5 rounded-xl hover:bg-(--foreground)/10 transition-all duration-200 active:scale-95"
              onClick={() => {
                const shareUrl = "https://escan.lucaprc.fr/?ean=" + data.ean;

                if (navigator.share) {
                  navigator.share({
                    title: "E.Scan - " + (data.title.length > 20 ?
                      data.title.slice(0, 20) + "..." : data.title),
                    text: "",
                    url: shareUrl,
                  }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareUrl);
                  notify({
                    message: "Lien copié",
                    error: false,
                  })
                } else {
                  prompt("Copiez ce lien :", shareUrl);
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-(--foreground)" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15 6.75C15 5.50736 16.0074 4.5 17.25 4.5C18.4926 4.5 19.5 5.50736 19.5 6.75C19.5 7.99264 18.4926 9 17.25 9C16.0074 9 15 7.99264 15 6.75ZM17.25 3C15.1789 3 13.5 4.67893 13.5 6.75C13.5 7.00234 13.5249 7.24885 13.5724 7.48722L9.77578 9.78436C9.09337 8.85401 7.99222 8.25 6.75 8.25C4.67893 8.25 3 9.92893 3 12C3 14.0711 4.67893 15.75 6.75 15.75C8.10023 15.75 9.28379 15.0364 9.9441 13.9657L13.5866 16.4451C13.5299 16.7044 13.5 16.9737 13.5 17.25C13.5 19.3211 15.1789 21 17.25 21C19.3211 21 21 19.3211 21 17.25C21 15.1789 19.3211 13.5 17.25 13.5C15.9988 13.5 14.8907 14.1128 14.2095 15.0546L10.4661 12.5065C10.4884 12.3409 10.5 12.1718 10.5 12C10.5 11.7101 10.4671 11.4279 10.4049 11.1569L14.1647 8.88209C14.8415 9.85967 15.971 10.5 17.25 10.5C19.3211 10.5 21 8.82107 21 6.75C21 4.67893 19.3211 3 17.25 3ZM15 17.25C15 16.0074 16.0074 15 17.25 15C18.4926 15 19.5 16.0074 19.5 17.25C19.5 18.4926 18.4926 19.5 17.25 19.5C16.0074 19.5 15 18.4926 15 17.25ZM4.5 12C4.5 10.7574 5.50736 9.75 6.75 9.75C7.99264 9.75 9 10.7574 9 12C9 13.2426 7.99264 14.25 6.75 14.25C5.50736 14.25 4.5 13.2426 4.5 12Z" fill="currentColor"/>
              </svg>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className={`bg-white/60 backdrop-blur-sm ${data?.images.length > 1 ? "mb-6" : "mb-0"} py-6 min-h-[280px]`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Slider {...sliderSettings}>
          {data.images.map((img, index) => (
            <div key={index} className="px-4">
              <motion.img
                src={img}
                alt={`Image ${index + 1}`}
                className="mx-auto h-64 object-contain rounded-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              />
            </div>
          ))}
        </Slider>
      </motion.div>

      <motion.div
        className="mx-4 mb-6 bg-(--background) rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {data.offer || data.stock > 0 ? (
          <div className="flex items-center justify-around py-6 px-5">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-white/60 font-medium mb-1">Prix</p>
              <p className="text-2xl text-(--foreground) font-bold">{data.price ?? "N/A"} €</p>
            </motion.div>
            <div className="h-12 w-px bg-white/20"></div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-white/60 font-medium mb-1">Stock</p>
              <p className="text-2xl text-white font-bold">
                {data.stock ?? "N/A"}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="py-6 px-5 text-center">
            <p className="text-lg text-red-400 font-semibold">
              Non disponible en magasin
            </p>
          </div>
        )}
      </motion.div>

      <motion.details
        className="mx-4 mb-6 bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        open={true}
      >
        <summary className="text-lg text-(--background) font-bold cursor-pointer px-6 py-5 hover:bg-white/40 transition-colors">
          Description
        </summary>
        <motion.div
          className="px-6 pb-5 text-sm text-gray-700 leading-relaxed"
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
