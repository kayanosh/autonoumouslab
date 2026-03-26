"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
      <ContainerScroll
        titleComponent={
          <>
            <div className="mb-4 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">
                AutoLabs Studio
              </span>
            </div>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Build premium apps and websites <br />
              <span className="mt-1 text-4xl leading-none font-bold md:text-[6rem]">
                that users love.
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80"
          alt="Product dashboard showcased on a laptop"
          height={720}
          width={1400}
          className="mx-auto h-full rounded-2xl object-cover object-left-top"
          draggable={false}
          priority
        />
      </ContainerScroll>
    </div>
  );
}
