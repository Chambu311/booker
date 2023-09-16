/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { GetServerSidePropsContext } from "next";

export default function CatalogDetail(props: { id: string }) {
  return <div className="">catalogo de id {props.id}</div>;
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context?.params?.id;
  return {
    props: {
      id,
    },
  };
}
