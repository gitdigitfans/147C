"use client";

import { useState, useTransition } from "react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { saveSetting } from "./actions";
import DeleteSettingButton from "./DeleteSettingButton";

const CORE_KEYS = ["phone", "whatsapp", "email", "site_name_ar", "site_name_en", "currency", "default_locale"];

export default function SettingsForm({ settingKey, value }: { settingKey: string; value: string }) {
  const [val, setVal] = useState(value || "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const isImage = settingKey.endsWith("_image");
  const isCore = CORE_KEYS.includes(settingKey);

  if (isImage) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-charcoal/60">{settingKey}</label>
          {!isCore && <DeleteSettingButton settingKey={settingKey} />}
        </div>
        <CloudinaryUploader
          resourceType="image"
          previewUrl={val}
          onUploaded={(url) => {
            setVal(url);
            startTransition(async () => {
              await saveSetting(settingKey, url);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            });
          }}
        />
        {saved && <p className="text-xs text-green-700 mt-1">تم الحفظ</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-charcoal/60">{settingKey}</label>
        {!isCore && <DeleteSettingButton settingKey={settingKey} />}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={(e) => { setVal(e.target.value); setSaved(false); }} className="flex-1 px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold" />
        <button
          disabled={pending}
          onClick={() => startTransition(async () => { await saveSetting(settingKey, val); setSaved(true); })}
          className="px-3 py-2 rounded-lg bg-gold-gradient text-white text-xs font-bold disabled:opacity-60"
        >
          {saved ? "تم الحفظ" : "حفظ"}
        </button>
      </div>
    </div>
  );
}
