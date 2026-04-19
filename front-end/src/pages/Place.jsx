import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Place = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (id) {
      const axiosGet = async () => {
        const { data } = await axios.get(`/places/${id}`);

        console.log(data);
        setPlace(data);
      };
      axiosGet();
    }
  }, [id]);

  if (!place) return <></>;

  return (
    <section>
      <div className="mx-auto flex grid max-w-7xl flex-col gap-8 p-8">
        <div>
          <div className="text-3xl font-bold">{place.title}</div>

          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <p>{place.address}</p>
          </div>
          <div className="grid aspect-[3/2] grid-cols-[2fr_1fr] grid-rows-2 gap-4 overflow-hidden rounded-2xl">
            {place.photos.map((photo) => (
              <img
                className="row-span-2 aspect-square h-full w-full object-cover"
                src={place.photos[0]}
                alt="imagem do local"
              />
            ))}

            <img
              className="aspect-square w-full object-cover"
              src={place.photos[1]}
              alt="imagem do local"
            />
            <img
              className="aspect-square w-full object-cover"
              src={place.photos[2]}
              alt="imagem do local"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Place;
