"use client";

import Slider from "react-slick";

type Props = {
  data: {
    title: string;
    description: string;
    images: string[];
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

  return (
    <div className="w-full bg-white rounded min-h-[calc(100vh-56px)] mb-[56px] shadow-md mt-6">
      <h2 className="text-xl text-black font-semibold pl-5 pt-5">{data.title}</h2>
      <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />

      <div className="rounded overflow-hidden">
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
      <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />
      <h3 className="text-lg text-gray-900 font-semibold pl-5 mt-3">Description</h3>
      <p className="text-sm pl-3 text-gray-800">{data.description}</p>
    </div>
  );
}
