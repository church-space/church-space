import { Button } from "@church-space/ui/button";

export default function WelcomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to Church Space</h1>
      <p className="text-lg">
        Church Space is a platform for creating and managing church content.
      </p>
      <Button>add domains</Button>
      <Button>add default footer details</Button>
      <Button>set email categories to public</Button>
      <Button>design and send your first email</Button>
      <Button>create a link list</Button>
      <Button>create a QR link</Button>
    </div>
  );
}
