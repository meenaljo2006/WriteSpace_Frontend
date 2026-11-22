import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PenTool,
  Sparkles,
  MessageSquare,
  Bell,
  Send,
  Bookmark,
  ArrowRight,
  Code2,
  Users,
  Globe,
  ArrowUpRight,
} from 'lucide-react';

/*  Data  */

const features = [
  {
    icon: PenTool,
    title: 'Rich Text Editor',
    description:
      'A distraction-free editor powered by Tiptap. Format text, embed images, and drop in syntax-highlighted code blocks with CodeMirror.',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description:
      'Beat writer’s block with AI-powered suggestions, tone adjustments, and real-time sentiment analysis.',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Threaded Conversations',
    description:
      'Go beyond likes. Build meaningful discussions with nested replies, reactions, and shares.',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description:
      'Instant updates the moment someone reacts, replies, or follows you — delivered in-app via WebSockets.',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
  },
  {
    icon: Send,
    title: 'Direct Messaging',
    description:
      'Take conversations private with real-time chat. Share drafts, swap ideas, and collaborate with writers.',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
  },
  {
    icon: Bookmark,
    title: 'Save & Discover',
    description:
      'Bookmark posts for later, search by keyword, and explore trending stories curated by the community.',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
  },
];

const steps = [
  {
    icon: Users,
    step: '01',
    title: 'Create your account',
    description:
      'Sign up with email — or one click with Google or GitHub. Set up your writer profile in under a minute.',
  },
  {
    icon: Code2,
    step: '02',
    title: 'Write with AI',
    description:
      'Draft in our rich editor. Let the AI assistant refine your tone, catch typos, or suggest where to expand.',
  },
  {
    icon: Globe,
    step: '03',
    title: 'Publish & connect',
    description:
      'Hit publish and watch the conversation unfold. Get notified, reply inline, and grow your audience.',
  },
];

/*  Motion variants  */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/*  Page  */

export default function Features() {
  return (
    <main className="bg-[#FFFBF5] dark:bg-[#0B192C] text-[#0B192C] dark:text-white transition-colors min-h-screen">
      
      {/* ========================= FEATURES SECTION ========================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-15">
        <div className="flex flex-col gap-12 sm:gap-16">
          
          {/* TOP: Centered Heading */}
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              Features that <span className="text-[#F97316]">work together</span>
            </h2>
            <p className="mt-5 text-[#0B192C]/70 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
              Six core capabilities, designed as one seamless writing experience. Everything you need to write, publish, and grow your audience.
            </p>

          </div>

          {/* BOTTOM: Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.article
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col rounded-2xl bg-white dark:bg-[#0f213a] border border-black/5 dark:border-white/10 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconBg} ${f.iconColor} mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">{f.title}</h3>
                  <p className="text-sm text-[#0B192C]/70 dark:text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </motion.article>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section className="bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-3 text-[#0B192C]/70 dark:text-gray-400">
              No setup, no friction. Just sign up and start writing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl bg-white dark:bg-[#0f213a] border border-black/5 dark:border-white/10 p-8 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#F97316] tracking-widest uppercase">
                      Step {s.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm text-[#0B192C]/70 dark:text-gray-400 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Arrow connector on desktop */}
                  {i < steps.length - 1 && (
                    <ArrowRight
                      aria-hidden
                      className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-600 z-10"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}