"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full sm:w-[56rem] h-auto rounded-xl p-8 border  ">
        <CardItem translateZ="100" className="w-full mt-6">
          <video
            src="/sample.mp4"
            height="1000"
            width="1000"
            className="w-full aspect-video object-cover rounded-xl group-hover/card:shadow-xl"
            autoPlay
            muted
            loop
            playsInline
          />
        </CardItem>
        <div className="flex justify-end items-center mt-6">
          <CardItem
            translateZ={20}
            as="a"
            href="#"
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white dark:text-black text-white text-sm font-semibold"
          >
            Try now →
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}


