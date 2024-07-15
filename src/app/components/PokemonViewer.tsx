"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
const axiosInstance = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});
const limit = 20;
type Pokemon = {
  name: string;
  url: string;
};
const useInfinitePokemons = () => {
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [fetchedPokemons, setFetchedPokemons] = useState<Pokemon[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const _internalFetchingStateRef = useRef(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    setIsFetching(true);
    axiosInstance
      .get("/pokemon", {
        params: { offset: fetchedPokemons.length, limit: limit },
      })
      .then((res) => {
        const results = res.data.results;
        const count = res.data.count;
        setFetchedPokemons(results);
        setTotal(count);
        setIsFetching(false);
      })
      .catch((err) => {
        setError(
          err.message ||
            "Some thing went wrong while we tried to fetch pokemons"
        );
        setIsFetching(false);
      });
  }, []);
  useEffect(() => {
    const handleScroll = (e: any) => {
      const clientHeight = (e.target as HTMLElement).clientHeight;
      const percentScroll =
        e.target.scrollTop / (e.target.scrollHeight - clientHeight);
      if (
        percentScroll > 0.8 &&
        !isFetching &&
        total > fetchedPokemons.length &&
        !_internalFetchingStateRef.current
      ) {
        setIsFetching(true);
        setError(null);
        _internalFetchingStateRef.current = true;
        axiosInstance
          .get("/pokemon", {
            params: { offset: fetchedPokemons.length, limit: limit },
          })
          .then((res) => {
            const results = res.data.results;
            const count = res.data.count;
            setFetchedPokemons((prev) => [...prev, ...results]);
            setTotal(count);
            _internalFetchingStateRef.current = false;
            setIsFetching(false);
          })
          .catch((err) => {
            setError(
              err.message ||
                "Some thing went wrong while we tried to fetch more pokemons"
            );
            _internalFetchingStateRef.current = false;
            setIsFetching(false);

            console.log(err);
          });
      }
    };
    containerRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching, fetchedPokemons, total]);

  return {
    fetchedPokemons,
    isFetching,
    total,
    containerRef,
    error,
  };
};
function PokemonViewer() {
  const { fetchedPokemons, isFetching, containerRef, total, error } =
    useInfinitePokemons();
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
      <p className="w-fit mx-auto text-gray-800 my-2">
        Inifinite Scroll to See Pokemons
      </p>
      <ul
        ref={containerRef}
        className="list-none gap-2 w-full h-[400px] overflow-y-auto space-y-3  bg-gray-500 rounded-t-lg rounded-b-lg py-2"
      >
        {fetchedPokemons.map((item) => {
          return (
            <li key={item.url} className="mx-auto w-fit text-gray-200">
              {item.name}
            </li>
          );
        })}
      </ul>
      {
        <p className="w-fit mx-auto mt-2 text-gray-600">
          {fetchedPokemons.length} of Total {total} Pokemons
        </p>
      }
      {isFetching && (
        <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ">
          <AiOutlineLoading3Quarters
            className="animate-spin text-white"
            size={20}
          />
        </span>
      )}
      {error && <p className="w-fit mx-auto mt-2 text-red-600">{error}</p>}
    </div>
  );
}

export default PokemonViewer;
