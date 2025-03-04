import { TextAnimate } from "@church-space/ui/text-annimate";

export default function Hero() {
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-7xl space-y-4 px-6">
        <div className="text-5xl font-bold">
          <TextAnimate animation="blurIn" by="character" once duration={0.1}>
            Free your ministry from app overload.
          </TextAnimate>
        </div>
        <div className="text-2xl font-semibold text-muted-foreground">
          <TextAnimate animation="blurInUp" by="character" once delay={0.5}>
            Free your ministry from app overload.
          </TextAnimate>
        </div>
      </div>
    </section>
  );
}
