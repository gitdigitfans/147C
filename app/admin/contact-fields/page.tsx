import { d1Query } from "@/lib/d1";
import FormModal from "./FormModal";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  text: "نص",
  email: "بريد إلكتروني",
  phone: "هاتف",
  textarea: "نص طويل",
};

export default async function AdminContactFieldsPage() {
  let fields: any[] = [];
  let errorMsg = "";
  try {
    fields = await d1Query("SELECT * FROM contact_form_fields ORDER BY sort_order");
  } catch (e: any) {
    errorMsg = e.message;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">حقول التواصل</h1>
        <FormModal />
      </div>
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">المفتاح</th>
              <th className="text-start p-3">التسمية</th>
              <th className="text-start p-3">النوع</th>
              <th className="text-start p-3">إلزامي</th>
              <th className="text-start p-3">الترتيب</th>
              <th className="text-start p-3">الحالة</th>
              <th className="text-start p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-charcoal/40">
                  لا توجد حقول بعد
                </td>
              </tr>
            )}
            {fields.map((f: any) => (
              <tr key={f.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-mono text-xs">{f.field_key}</td>
                <td className="p-3 font-bold">{f.label_ar}</td>
                <td className="p-3">{TYPE_LABELS[f.field_type] || f.field_type}</td>
                <td className="p-3">{f.is_required ? "نعم" : "لا"}</td>
                <td className="p-3">{f.sort_order}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {f.is_active ? "مفعل" : "معطل"}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <FormModal
                    initial={{
                      id: f.id,
                      field_key: f.field_key,
                      label_ar: f.label_ar,
                      label_en: f.label_en || "",
                      field_type: f.field_type,
                      is_required: !!f.is_required,
                      sort_order: f.sort_order,
                      is_active: !!f.is_active,
                    }}
                  />
                  <DeleteButton id={f.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
