"use client";

import { useState, type FormEvent } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-hero)" }}
            >
              GET IN TOUCH
            </h1>
            <p className="text-foreground-muted text-lg mb-6">
              Sponsorship enquiries, press, partnerships, or just want to say
              hello.
            </p>
            <p className="text-sm text-foreground-muted">
              Or email directly:{" "}
              <a
                href="mailto:anthony@roadmancycling.com"
                className="text-coral hover:text-coral-hover underline underline-offset-4 font-medium"
              >
                anthony@roadmancycling.com
              </a>
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            {status === "success" ? (
              <div className="text-center py-12">
                <h2 className="font-heading text-3xl text-coral mb-4">
                  MESSAGE SENT
                </h2>
                <p className="text-foreground-muted">
                  Thanks for reaching out. We&apos;ll get back to you as soon as
                  we can.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block font-heading text-sm text-off-white mb-2">
                      NAME
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block font-heading text-sm text-off-white mb-2">
                      EMAIL
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block font-heading text-sm text-off-white mb-2">
                    SUBJECT
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    className={`${inputClasses} appearance-none`}
                  >
                    <option value="" className="bg-charcoal">
                      Select a topic
                    </option>
                    <option value="sponsorship" className="bg-charcoal">
                      Sponsorship / Advertising
                    </option>
                    <option value="press" className="bg-charcoal">
                      Press / Media
                    </option>
                    <option value="partnership" className="bg-charcoal">
                      Partnership
                    </option>
                    <option value="guest" className="bg-charcoal">
                      Podcast Guest Suggestion
                    </option>
                    <option value="general" className="bg-charcoal">
                      General Enquiry
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block font-heading text-sm text-off-white mb-2">
                    MESSAGE
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="
                    w-full font-heading tracking-wider text-lg
                    bg-coral hover:bg-coral-hover disabled:opacity-50
                    text-off-white px-8 py-4 rounded-md
                    transition-colors cursor-pointer
                  "
                >
                  {status === "loading" ? "SENDING..." : "SEND MESSAGE"}
                </button>

                {status === "error" && (
                  <p className="text-red-400 text-sm text-center" role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
