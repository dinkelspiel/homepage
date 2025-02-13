import { ArrowRight, ArrowUpRight, Heart } from "lucide-react";
import { Roboto_Condensed } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { SiGithub, SiYoutube } from "@icons-pack/react-simple-icons";
import slug from "slug";

const robotoCondensed = Roboto_Condensed({ subsets: ["latin"] });
const PlaywriteCU = localFont({ src: "../styles/PlaywriteCU.ttf" });

import React from "react";
import Tag from "~/components/tag";
import { readdir } from "fs/promises";
import { loadPost } from "~/server/md/loadPost";
import ImageWheel from "./_components/imageWheel";

import animation from "~/styles/animation.module.css";

const Home = async () => {
  const posts = (await readdir("src/posts")).map((post) => loadPost(post));

  return (
    <div className="mx-auto flex flex-col items-center gap-8 px-6 pb-6 lg:px-0">
      <Link
        href="/"
        className={`${animation.fadeDown} ${animation.delay200} relative my-6 cursor-pointer text-center`}
      >
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

      <div
        className={`${animation.fade} ${animation.delay600} mx-auto flex max-w-[1000px] flex-col items-center gap-8`}
      >
        <p className="flex max-w-[60ch] flex-wrap items-center justify-center gap-2 text-center text-lg font-medium">
          Welcome to my little corner of the internet.{" "}
          <Heart className="rotate-12 rounded-lg fill-[#ee2c05] stroke-[#ee2c05]" />
          {" I'm"} a Web Developer and occasional hobbyist Game Developer.
        </p>
        <div className="flex gap-4">
          <Link href="https://github.com/dinkelspiel">
            <SiGithub />
            <div className="sr-only">Link to my github</div>
          </Link>
          <Link href="https://youtube.com/@keiidev">
            <SiYoutube />
            <div className="sr-only">Link to my youtube</div>
          </Link>
        </div>
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6">
            <h2
              className={`${robotoCondensed.className} text-2xl font-semibold`}
            >
              Latest{" "}
              <span className={`${PlaywriteCU.className} text-[#ee2c05]`}>
                Blog
              </span>{" "}
              Posts
            </h2>
            <ul className="flex w-full flex-col gap-3">
              {posts
                .sort(
                  (a, b) =>
                    b.data.published.getTime() - a.data.published.getTime(),
                )
                .map((post) => (
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    href={`/posts/${slug(post.data.title)}`}
                    key={post.content}
                  >
                    <li className="group flex cursor-pointer items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold">
                          {post.data.title}
                        </div>
                        <div className="text-neutral-500">
                          {post.data.published.toDateString()}
                        </div>
                      </div>
                      <ArrowRight className="size-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </li>
                  </Link>
                ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-6">
            <h2
              className={`${robotoCondensed.className} text-2xl font-semibold`}
            >
              My{" "}
              <span className={`${PlaywriteCU.className} text-[#ee2c05]`}>
                Projects
              </span>{" "}
            </h2>
            <div className="grid gap-4">
              <Link
                className="group flex cursor-pointer flex-col gap-4 lg:flex-row"
                href={"https://medialog.keii.dev"}
              >
                <Image
                  width={160}
                  height={230}
                  alt="Medialog"
                  src="https://medialog.keii.dev/_next/image?url=%2Fdashboard.png&w=1920&q=75"
                  className="h-[80px] w-[130px] rounded-lg border border-neutral-200 shadow-sm"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-semibold">
                    Medialog{" "}
                    <ArrowUpRight className="size-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-sm text-neutral-500">
                    An open source alternative to Letterboxd, GoodReads, and
                    MyAnimeList all in one
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Tag>Next.JS</Tag>
                    <Tag>Tailwind CSS</Tag>
                    <Tag>MariaDB</Tag>
                    <Tag>Docker</Tag>
                  </div>
                </div>
              </Link>
              <Link
                className="group flex cursor-pointer flex-col gap-4 lg:flex-row"
                href={"https://kirakira.keii.dev"}
              >
                <Image
                  width={160}
                  height={230}
                  alt="Kirakira"
                  src="/kirakira.png"
                  className="h-[80px] w-[130px] rounded-lg border border-neutral-200 shadow-sm"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-semibold">
                    Kirakira{" "}
                    <ArrowUpRight className="size-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-sm text-neutral-500">
                    A forum made in Gleam for the Gleam community
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Tag>Gleam</Tag>
                    <Tag>Lustre</Tag>
                    <Tag>Wisp</Tag>
                    <Tag>Docker</Tag>
                    <Tag>Mysql</Tag>
                  </div>
                </div>
              </Link>
              <ImageWheel
                images={[
                  {
                    src: "/controlpanel1.png",
                    alt: "Apps in an tenant",
                  },
                  {
                    src: "/controlpanel2.png",
                    alt: "Settings for an tenant including, name, url, and transferring all apps in an organisation to another tenant",
                  },
                  {
                    src: "/controlpanel3.png",
                    alt: "Permission groups in a tenant, used for assigning permission flags in apps",
                  },
                  {
                    src: "/controlpanel4.png",
                    alt: "Log page for the Killergame app",
                  },
                  {
                    src: "/controlpanel5.png",
                    alt: "Permissions page for app for assigning permission flags to groups or users",
                  },
                  {
                    src: "/controlpanel6.png",
                    alt: "Login page for app shown to new users",
                  },
                  {
                    src: "/controlpanel7.png",
                    alt: "Login page for app shown to returning users",
                  },
                ]}
              >
                <div className="group flex cursor-pointer flex-col gap-4 lg:flex-row">
                  <Image
                    width={160}
                    height={230}
                    alt="Controlpanel"
                    src="/controlpanel1.png"
                    className="h-[80px] w-[130px] rounded-lg border border-neutral-200 shadow-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold">
                      Controlpanel{" "}
                    </div>
                    <div className="text-left text-sm text-neutral-500">
                      A service I developed in high school for managing
                      authentication, authorization, and logging for various
                      applications used by the school through an OAuth2 login
                      system (like Google Login)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Tag>Next.JS</Tag>
                      <Tag>Tailwind CSS</Tag>
                      <Tag>MariaDB</Tag>
                      <Tag>Docker</Tag>
                    </div>
                  </div>
                </div>
              </ImageWheel>
              <ImageWheel
                images={[
                  {
                    src: "/killergame1.png",
                    alt: "Killergame when waiting for the start",
                  },
                  {
                    src: "/killergame2.png",
                    alt: "Killergame during the game",
                  },
                ]}
              >
                <div className="group flex cursor-pointer flex-col gap-4 lg:flex-row">
                  <Image
                    width={160}
                    height={230}
                    alt="Killergame"
                    src="/killergame1.png"
                    className="h-[80px] w-[130px] rounded-lg border border-neutral-200 shadow-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold">
                      Killergame{" "}
                    </div>
                    <div className="text-left text-sm text-neutral-500">
                      A game popular with universities in the us where each
                      participating student gets another student to tag. I made
                      this for my high school and each term around 200 students
                      participate
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Tag>Next.JS</Tag>
                      <Tag>Tailwind CSS</Tag>
                      <Tag>MariaDB</Tag>
                      <Tag>Docker</Tag>
                    </div>
                  </div>
                </div>
              </ImageWheel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
