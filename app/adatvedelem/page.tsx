import LegalPage from "../components/LegalPage";
import { PRIVACY } from "../lib/legal";
import { pageMetadata } from "../lib/meta";

export const metadata = pageMetadata("privacy", PRIVACY.description);

export default function Page() {
  return <LegalPage doc={PRIVACY} pageKey="privacy" />;
}
