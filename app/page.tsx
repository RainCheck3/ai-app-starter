import { Chat } from "@/components/chat";
import { getAIConfig } from "@/lib/ai";
export const dynamic = "force-dynamic";
export default function Home() {
  const { demo, configured } = getAIConfig();
  return <Chat mode={demo ? "Demo" : configured ? "Live" : "Not configured"} />;
}
