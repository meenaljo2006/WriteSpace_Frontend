import { motion } from 'framer-motion';

export default function EditorPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl shadow-black/5 overflow-hidden"
      >
        {/* fake toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-3 text-xs text-neutral-400">untitled-draft.md</span>
        </div>

        {/* content */}
        <div className="p-6 md:p-8 font-serif space-y-3 text-left">
          <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            The quiet craft of writing
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every good essay starts as a messy draft. WriteSpace gives you a
            quiet, distraction-free space to let your ideas breathe.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Rich formatting, code blocks, and real-time conversation —{' '}
            <span className="relative">
              all in one place
              <span className="ml-0.5 inline-block w-0.5 h-5 bg-amber-600 align-middle animate-caret" />
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}