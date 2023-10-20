import type { NextPage } from "next";
import Head from "next/head";
import { InitQuestionView } from "../views";

const InitQuestions: NextPage = (_props) => {
  return (
    <div>
      <Head>
        <title>Raise Question</title>
        <meta
          name="description"
          content="Raise Question"
        />
      </Head>
      <InitQuestionView />
    </div>
  );
};

export default InitQuestions;