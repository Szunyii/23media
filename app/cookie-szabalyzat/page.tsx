import LegalPage from "../components/LegalPage";
import { COOKIES } from "../lib/legal";
import { pageMetadata } from "../lib/meta";

export const metadata = pageMetadata("cookies", COOKIES.description, COOKIES.title);

export default function Page() {
  return <LegalPage doc={COOKIES} pageKey="cookies" />;
}
