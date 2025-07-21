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
      className="w-full bg-white rounded min-h-[calc(100vh-56px)] mb-[56px] shadow-md mt-6 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="text-xl text-black font-semibold px-5 pt-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {data.title}
      </motion.h2>

      <motion.hr
        className="my-2 w-[calc(100%-3rem)] mx-auto"
        initial={{ width: 0 }}
        animate={{ width: "calc(100% - 3rem)" }}
        transition={{ delay: 0.2 }}
      />

      <motion.div
        className={`rounded ${data?.images.length > 1 ? "mb-5" : "mb-0"} h-min-[100px]`}
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

      <motion.hr
        className="my-2 w-[calc(100%-3rem)] mx-auto"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />

      <motion.div
        className="flex items-center justify-around px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {data.offer || data.stock > 0 ? (
          <>
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-900 font-semibold">Prix:</h3>
              <span className="text-lg text-gray-800">{data.price ?? "No price found"} €</span>
            </div>
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-900 font-semibold">Stock:</h3>
              <span className="text-lg text-gray-800">
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

      <motion.hr
        className="my-2 w-[calc(100%-3rem)] mx-auto"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />

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
          className="mt-2 pl-3 text-sm text-gray-800"
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
    </motion.div>
  );

}
