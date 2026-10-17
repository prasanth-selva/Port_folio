"use client";

import dynamic from "next/dynamic";

const CyberCoreScroll = dynamic(() => import("@/components/hero/CyberCoreScroll"), {
  ssr: false,
});

export default CyberCoreScroll;
