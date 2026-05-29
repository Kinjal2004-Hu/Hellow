import { ChevronRight, Sparkles, ArrowRight, Newspaper } from "lucide-react";

const btn = "transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]";

export function DashboardHome() {
  const newsCards = [
    {
      title: "Namco: Legendary arcade energy returns",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      label: "Gaming",
    },
    {
      title: "Warm studio lighting for morning focus",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      label: "Workspace",
    },
    {
      title: "Red mesh visuals for the evening feed",
      image:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      label: "Trending",
    },
  ];

  return (
    <div className="max-w-[1120px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in px-6 py-6">
      <section className="xl:col-span-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[12px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Micro-Learning
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground pr-1">
            <Sparkles className="h-3 w-3" />
            Short reads, big ideas
          </span>
        </div>

        <article className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden flex flex-col md:flex-row min-h-[340px]">
          <div className="md:w-[320px] relative min-h-[340px] bg-muted">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
              alt="People working at a desk"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#264234]/12" />
            <span className="absolute top-4 left-4 px-3 py-0.5 rounded-full bg-white/92 text-[11px] font-medium text-foreground/85 shadow-soft flex items-center gap-1">
              <span className="text-[13px] leading-none">◫</span>
              Productivity
            </span>
          </div>
          <div className="flex-1 px-6 py-6 md:px-7 md:py-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-3">
              <span>Cal Newport</span>
              <span className="text-border">•</span>
              <span>3 min read</span>
            </div>
            <h2 className="text-[32px] font-semibold tracking-tight leading-[1.05] max-w-[520px]">
              The Power of Deep Work
            </h2>
            <p className="mt-3 text-[16px] text-muted-foreground leading-[1.55] max-w-[525px]">
              Deep work is the ability to focus without distraction on a
              cognitively demanding task. It&apos;s a skill that lets you master
              complicated information and produce better results in less time.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium shadow-sm ${btn}`}
              >
                Next idea <ArrowRight className="h-[16px] w-[16px]" />
              </button>
              <span className="text-[12px] text-muted-foreground">1 / 5</span>
            </div>
          </div>
        </article>
      </section>

      <section className="xl:col-span-3">
        <div className="mt-2 mb-4 px-1">
          <span className="text-[12px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Latest
          </span>
          <h2 className="text-[22px] font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-muted-foreground" />
            News for you
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {newsCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl overflow-hidden bg-surface border border-border shadow-card card-hover"
            >
              <div className="aspect-[16/10] relative bg-muted">
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
                  {card.label}
                </div>
                <h3 className="text-[14px] font-semibold leading-snug text-foreground/90">
                  {card.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
