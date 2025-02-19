"use client";

import { useEffect, useRef } from "react";
import { usePco } from "./use-pco";

interface PcoData {
  id: string | null;
  access_token: string | null;
}

export default function InitPco({ pcoData }: { pcoData: PcoData }) {
  const initState = useRef(false);

  useEffect(() => {
    if (!initState.current && pcoData) {
      usePco.setState({
        id: pcoData.id,
        accessToken: pcoData.access_token,
      });
    }

    initState.current = true;
  }, [pcoData]);

  return null;
}
