import React from "react";
import { Input } from "@church-space/ui/input";
import { Search as SearchIcon } from "@church-space/ui/icons";

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <h1 className="flex h-96 w-full flex-col items-center justify-center bg-primary font-bold">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-white">
          <h1 className="text-5xl font-semibold">Hi. How can we help?</h1>

          <div className="relative w-full">
            <Input
              autoFocus
              className="peer h-12 w-full bg-card ps-10 font-normal text-foreground"
              placeholder="Search for questions, keywords, or topics"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon height={"24"} width={"24"} aria-hidden="true" />
            </div>
          </div>
        </div>
      </h1>
      <h1 className="text-4xl font-bold">Topics</h1>
    </div>
  );
}
