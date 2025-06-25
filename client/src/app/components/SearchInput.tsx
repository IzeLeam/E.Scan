"use client";

import { useRef, useState } from "react";
import Slider from "react-slick";

export default function SearchInput() {
  const [eanValue, setEanValue] = useState("");
  const [data, setData] = useState<null | {
    title: string;
    description: string;
    images: string[];
    price: number;
    stock: number;
    rawData: string;
  }>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ean = e.target.value.replaceAll(" ", "");
    setEanValue(ean);
    if (/^\d{13}$/.test(ean)) {
      const res = await fetch(
        `https://api.escan.lucaprc.fr/search?ean=${ean}`
      );
      const fetchedData = await res.json();
      setData(fetchedData);
    } else {
      setData(null);
    }
  };

  const handleClear = () => {
    setEanValue("");
    setData(null);
    inputRef.current?.focus();
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
    <div className="text-white p-4 max-w-md mx-auto relative">
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          pattern="\d*"
          inputMode="numeric"
          placeholder="Entrez un code EAN"
          value={eanValue}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border border-gray-300 pr-10"
        />
        {eanValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
            aria-label="Effacer"
          >
            &#10005;
          </button>
        )}
      </div>

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
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <strong>Prix :</strong> {data.price} €
            </div>
            <div>
              <strong>Stock :</strong> {data.stock}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
