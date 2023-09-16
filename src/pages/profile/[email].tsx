/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { GetServerSidePropsContext } from "next";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import {useEffect, useState} from 'react';

/* eslint-disable @typescript-eslint/require-await */
export default function Profile(props: { email: string }) {
  return (
    <div className="">
        <div className="">Bienvenido al perfil de {props.email}</div>
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  console.log("context", context?.params?.email);
  const email = context?.params?.email;
  return {
    props: {
      email,
    },
  };
}
