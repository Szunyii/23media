import LegalPage from "../components/LegalPage";
import { IMPRINT } from "../lib/legal";
import { pageMetadata } from "../lib/meta";

export const metadata = pageMetadata("imprint", IMPRINT.description);

export default function Page() {
  return <LegalPage doc={IMPRINT} pageKey="imprint" />;
}
