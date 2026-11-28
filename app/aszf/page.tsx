import LegalPage from "../components/LegalPage";
import { TERMS } from "../lib/legal";
import { pageMetadata } from "../lib/meta";

// The links say "ÁSZF"; the tab and search result carry the full title.
export const metadata = pageMetadata("terms", TERMS.description, TERMS.title);

export default function Page() {
  return <LegalPage doc={TERMS} pageKey="terms" />;
}
