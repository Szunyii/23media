import LegalPage from "../components/LegalPage";
import { TERMS } from "../lib/legal";
import { pageMetadata } from "../lib/meta";

export const metadata = pageMetadata("terms", TERMS.description);

export default function Page() {
  return <LegalPage doc={TERMS} pageKey="terms" />;
}
