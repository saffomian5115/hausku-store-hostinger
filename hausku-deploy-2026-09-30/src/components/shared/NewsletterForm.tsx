"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function NewsletterForm({
  placeholder,
  cta,
}: {
  placeholder: string;
  cta: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 text-lime-300 font-medium max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5" />
        <span>Danke für deine Anmeldung! 🌱</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label={placeholder}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap text-center"
      >
        {cta}
      </button>
    </form>
  );
}
