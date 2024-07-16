/* eslint-disable @typescript-eslint/no-unused-vars */
import { readFile } from "fs/promises";
import matter from "gray-matter";
import React from "react";
import { loadPost } from "~/server/md/loadPost";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import Link from "next/link";
import { Roboto_Condensed } from "next/font/google";
import localFont from "next/font/local";

const robotoCondensed = Roboto_Condensed({ subsets: ["latin"] });
const PlaywriteCU = localFont({ src: "../../../styles/PlaywriteCU.ttf" });

const Page = async ({ params }: { params: { post: string } }) => {
  const post = loadPost(params.post);

  return (
    <div className="mx-auto flex max-w-[60ch] flex-col gap-8 pb-8">
      <Link href="/" className="relative my-6 cursor-pointer text-center">
        <h1
          className={`${robotoCondensed.className} text-8xl font-black text-[#ee2c05] sm:text-9xl`}
        >
          WILLEM
        </h1>
        <div
          className={`${PlaywriteCU.className} absolute bottom-1 left-1/2 -translate-x-1/2 text-4xl font-normal sm:text-5xl`}
        >
          Dinkelspiel
        </div>
      </Link>
      <div className="flex flex-col gap-8 px-6 leading-normal lg:px-0">
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1(props) {
              const { node, ...rest } = props;
              return <h1 className="text-4xl font-semibold" {...rest} />;
            },
            a(props) {
              const { node, ...rest } = props;
              return <a className="text-sky-600 hover:underline" {...rest} />;
            },
            i(props) {
              const { node, ...rest } = props;
              return <i className="text-neutral-700" {...rest} />;
            },
            img(props) {
              const { node, src, ...rest } = props;
              return (
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  width={644 as any}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  height={362 as any}
                  alt="cover image"
                  src={src!}
                  className="rounded-2xl border border-neutral-200 shadow-sm"
                  {...rest}
                />
              );
            },
          }}
        >
          {post.content}
        </Markdown>
      </div>
    </div>
  );
};

export default Page;
