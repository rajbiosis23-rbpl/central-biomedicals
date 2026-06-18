import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="group bg-white rounded-[30px] p-8 border border-slate-100 card-shadow hover:-translate-y-2 transition-all duration-300">

      {/* Icon */}
      <div className="w-16 h-16 rounded-[22px] bg-sky-100 text-sky-700 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-slate-900 mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 leading-7 mb-6">
        {description}
      </p>

      {/* Link */}
      {/* <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sky-700 font-semibold"
      >
        Learn More
        <ArrowUpRight
          size={18}
          className="group-hover:translate-x-1 transition"
        />
      </Link> */}
    </div>
  );
}