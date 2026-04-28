import React, { useEffect, useState } from "react";
import { Item } from "../components/Item";
import axios from "axios";
import { useLocation } from "react-router-dom";

export const Home = () => {
  const [places, setPlaces] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchPlaces = async () => {
      const params = new URLSearchParams(location.search);
      const queryString = params.toString();
      const url = queryString ? `/places?${queryString}` : "/places";
      const { data } = await axios.get(url);
      setPlaces(data);
    };
    fetchPlaces();
  }, [location.search]);

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
