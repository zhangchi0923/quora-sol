import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>ANSK Solana</title>
        <meta
          name="description"
          content="ANSK Solana"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
