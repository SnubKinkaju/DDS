import { CircleAlert } from "lucide-react";

export default function ErrorMessage({ error, className = "my-6" }) {
  if (!error) return null;
  const message = typeof error === "string" ? error : error.message;
  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-md border border-hairline p-4 text-sm ${className}`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-error text-white">
        <CircleAlert aria-hidden="true" size={18} />
      </span>
      <div className="pt-1.5">
        <p className="font-semibold text-ink">{message}</p>
        {error.details?.map((detail, index) => (
          <p key={index} className="mt-1 text-body">
            {detail.champ} : {detail.message}
          </p>
        ))}
      </div>
    </div>
  );
}
