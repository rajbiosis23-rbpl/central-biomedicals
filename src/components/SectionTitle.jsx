export default function SectionTitle({
  badge,
  title,
  description,
  center = false,
}) {
  return (
    <div
      className={`${
        center ? "text-center mx-auto" : ""
      } max-w-3xl`}
    >
      {/* Badge */}
      {badge && (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-5">
          {badge}
        </div>
      )}

      {/* Title */}
      <h2 className="section-title">
        {title}
      </h2>

      {/* Description */}
      <p className="section-subtitle">
        {description}
      </p>
    </div>
  );
}