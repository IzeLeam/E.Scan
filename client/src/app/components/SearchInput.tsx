"use client";

import { useState } from "react";
import Slider from "react-slick";

export default function SearchInput() {
  const [data, setData] = useState<null | {
    title: string;
    description: string;
    images: string[];
    price: number;
    stock: number;
    rawData: string;
  }>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ean = e.target.value.replaceAll(" ", "");
    if (/^\d{13}$/.test(ean)) {
      const res = await fetch(
        `https://api.escan.lucaprc.fr/search?ean=${ean}`
      );
      const fetchedData = await res.json();
      setData(fetchedData);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="text-white p-4 max-w-md mx-auto h-screen">
      <input
        type="text"
        pattern="\d*"
        inputMode="numeric"
        placeholder="Entrez un code EAN"
        onChange={handleChange}
        className="mb-4 w-full px-4 py-2 rounded border border-gray-300"
      />

      {data && (
        <div className="bg-white text-black rounded-lg p-4 shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-center">{data.title}</h2>

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

          <p className="text-sm text-gray-800">{data.description}</p>
          <div className="text-sm text-gray-600">
            <strong>Stock :</strong> {data.stock}
          </div>
          <p>{JSON.stringify(data.rawData)}</p>
        </div>
      )}
    </div>
  );
}
