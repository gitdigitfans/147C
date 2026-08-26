import { d1Query } from "@/lib/d1";
import ContactClient, { BranchVM, ContactFieldVM } from "./ContactClient";


async function getSetting(key: string): Promise<string> {
  try {
    const rows = await d1Query<{ value: string }>("SELECT value FROM site_settings WHERE key=?", [key]);
    return rows[0]?.value || "";
  } catch {
    return "";
  }
}

export default async function ContactPage() {
  let branches: BranchVM[] = [];
  try {
    branches = await d1Query<BranchVM>("SELECT * FROM branches WHERE is_active=1 ORDER BY sort_order");
  } catch {
    branches = [];
  }

  let fields: ContactFieldVM[] = [];
  try {
    fields = await d1Query<ContactFieldVM>(
      "SELECT * FROM contact_form_fields WHERE is_active=1 ORDER BY sort_order"
    );
  } catch {
    fields = [];
  }

  const [phone, email] = await Promise.all([getSetting("phone"), getSetting("email")]);

  return (
    <ContactClient
      branches={branches}
      fields={fields}
      phone={phone || "+20 100 000 0000"}
      email={email || "info@pharaohfurniture.com"}
    />
  );
}
