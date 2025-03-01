import { TextAnimate } from "@church-space/ui/text-annimate";
import { Cpu, Lock, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-6 space-y-4">
        <div className="text-5xl font-bold">
          <TextAnimate animation="blurIn" by="character" once duration={0.1}>
            Free your ministry from app overload.
          </TextAnimate>
        </div>
        <div className="text-2xl text-muted-foreground font-semibold">
          <TextAnimate animation="blurInUp" by="character" once delay={0.5}>
            Free your ministry from app overload.
          </TextAnimate>
        </div>
      </div>
    </section>
  );
}
