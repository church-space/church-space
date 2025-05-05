"use client";
import React from "react";

// TODO: about page

export default function AboutPage() {
  return (
    <div className="mx-auto my-20 w-full max-w-4xl space-y-4 px-6">
      <h1 className="w-full pb-4 text-left text-5xl font-bold leading-tight md:text-center">
        Why we&apos;re building <br />
        Church Space
      </h1>
      <p className="text-lg">
        Church Space exists to free ministries from app overload. That journey
        begins with communication tools.
      </p>
      <p className="text-lg">
        In ministry, I&apos;ve consistently felt that I&apos;ve been stuck when
        it comes to software. Our church has either overpaid for enterprise
        software that does far more than we need or we&apos;ve used software
        made for churches and found it lacking when it comes to features and
        craft.
      </p>
      <p className="text-lg">
        So we set out with a simple goal:{" "}
        <b>
          create well-crafted, affordable software that help local churches
          operate effectively, communicate clearly, and care intentionally.
        </b>
      </p>
      <p className="text-lg">
        We&apos;re excited to be on this journey, and we can&apos;t wait to
        serve you.
      </p>
      <p className="pt-8 text-lg">
        <b>Thomas Harmond</b>
        <br />
        Founder
      </p>
    </div>
  );
}
