"use client";

import Slider from "react-slick";

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
    <div className="w-full bg-white rounded min-h-[calc(100vh-56px)] mb-[56px] shadow-md mt-6 overflow-hidden">
      <h2 className="text-xl text-black font-semibold px-5 pt-5">{data.title}</h2>
      <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />

      <div className="rounded {data?.images.length > 1 ? mb-5 : mb-0} h-min-[100px]">
        <Slider {...sliderSettings}>
          {data.images.map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="mx-auto h-64 object-contain"
              />
            </div>
          ))}
        </Slider>
      </div>

      <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />
        {data.offer ? (
          <div className="flex items-center justify-around px-5">
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-900 font-semibold">Prix:</h3>
              <span className="text-lg text-gray-800">{data.price ?? "No price found"} €</span>
            </div>
            <div>
              <h3 className="text-lg inline-block mr-3 text-gray-900 font-semibold">Stock:</h3>
              <span className="text-lg text-gray-800">{data.stock ?? "No stock information"}</span>
            </div>
          </div>
          ) : (
          <div className="flex items-center justify-around px-5">
            <div className="text-lg text-red-600 font-semibold">
              <h3 className="inline-block text-black mr-3">Non disponible en magasin</h3>
            </div>
          </div>
        )}
      <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />
      <details className="pl-5 mt-3" open={true}>
        <summary className="text-lg text-gray-900 font-semibold cursor-pointer">
          Description
        </summary>
        <div className="mt-2 pl-3 text-sm text-gray-800">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <p>{data.description}</p>
          )}
        </div>
      </details>
      <details className="pl-5 mt-3">
        <summary className="text-lg text-gray-900 font-semibold cursor-pointer">
          Raw Data
        </summary>
        <pre className="text-sm pl-3 text-gray-800 whitespace-pre-wrap mt-2">
          {typeof data.rawData === 'string'
            ? (() => {
                try {
                  return JSON.stringify(JSON.parse(data.rawData), null, 2);
                } catch (_e) {
                  return data.rawData;
                }
              })()
            : JSON.stringify(data.rawData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
