"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Mail01Icon, 
  Location01Icon, 
  CallIcon, 
  Clock01Icon, 
  SentIcon 
} from "@hugeicons/core-free-icons";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        toast.success("Message sent successfully!");
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-gradient">
            Get in Touch
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
            Have a question or need assistance? Our team is here to help you around the clock.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-3">
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 text-primary" />
                  </div>
                  Send a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className="h-9 rounded bg-secondary/30 border-white/5 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Email Address</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-9 rounded bg-secondary/30 border-white/5 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="How can we help?" className="h-9 rounded bg-secondary/30 border-white/5 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Write your message here..." className="min-h-[120px] rounded bg-secondary/30 border-white/5 text-xs" />
                  </div>
                  <Button type="submit" className="w-full h-10 rounded shadow-lg shadow-primary/20 font-black text-xs transition-all hover:scale-[1.01]" disabled={loading}>
                    {loading ? "Transmitting..." : (
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="md:col-span-2 space-y-4">
            {[
              { icon: CallIcon, title: "Call Us", detail: "1-800-BUYBEE", sub: "Mon-Fri, 9AM-6PM EST" },
              { icon: Mail01Icon, title: "Email Support", detail: "support@buybee.com", sub: "24/7 dedicated support" },
              { icon: Location01Icon, title: "Our Office", detail: "123 Commerce St, SC 12345", sub: "United States" },
              { icon: Clock01Icon, title: "Business Hours", detail: "9AM - 6PM EST", sub: "Saturday: 10AM - 4PM" },
            ].map((info, i) => (
              <Card key={i} className="glassmorphism dark:glassmorphism-dark border-none rounded-xl hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={info.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-primary mb-0.5">{info.title}</h3>
                    <p className="font-bold text-sm">{info.detail}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{info.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
