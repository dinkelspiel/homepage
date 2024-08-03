/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { CodeBlock } from "react-code-blocks";

const InternalCodeBlock = ({ rest }: { rest: any }) =>
  (rest.children ?? "").split("\n").length <= 1 ? (
    <span className="rounded-md bg-neutral-200 px-1 font-mono">
      {rest.children}
    </span>
  ) : (
    <CodeBlock
      text={rest.children}
      language={
        ({ rs: "rust" } as Record<string, string>)[
          rest.className.split("-")[1]
        ] ?? undefined
      }
    />
  );

export default InternalCodeBlock;
