import Image from "next/image";
import PokemonViewer from "./components/PokemonViewer";

export default function Home() {
  return (
    <main className="relative lex min-h-screen flex-col items-center justify-between p-24">
      <PokemonViewer />
    </main>
  );
}
