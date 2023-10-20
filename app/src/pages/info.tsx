import type { NextPage } from "next";
import Head from "next/head";
import { InfoView } from "../views";

const Infos: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <InfoView />
    </div>
  );
};

export default Infos;
