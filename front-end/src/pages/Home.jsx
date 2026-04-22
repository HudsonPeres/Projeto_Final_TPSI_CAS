import React, { useEffect, useState } from "react";
import { Item } from "../components/Item";
import axios from "axios";

export const Home = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const axiosGet = async () => {
      const { data } = await axios.get("/places");
      setPlaces(data);
    };

    axiosGet();
  }, []);
  return (
    <section>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {places.map((place) => (
          <Item {...{ place }} key={place._id} />
        ))}
      </div>
    </section>
  );
};
