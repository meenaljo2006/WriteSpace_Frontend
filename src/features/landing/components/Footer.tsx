import { Link } from "react-router-dom";
import { Feather, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#FFFBF5] dark:bg-[#0B192C] border-t border-[#0B192C]/10 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-full bg-[#F97316]/10">
                <Feather className="w-6 h-6 text-[#F97316]" />
              </div>
              <span className="font-bold text-2xl text-[#0B192C] dark:text-white">
                WriteSpace
              </span>
            </Link>
            <p className="text-sm text-[#0B192C]/70 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
              A quiet space for your loudest ideas. Join thousands of developers and creators sharing knowledge.
            </p>

            {/* Newsletter Signup */}
            <div className="w-full max-w-sm">
              <h4 className="text-sm font-semibold text-[#0B192C] dark:text-white mb-3">Subscribe to our newsletter</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 rounded-lg border border-[#0B192C]/20 dark:border-gray-700 bg-white dark:bg-[#15233B] text-sm text-[#0B192C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-all"
                />
                <button className="p-2.5 rounded-lg bg-[#F97316] text-white hover:bg-[#ea580c] transition-colors shadow-lg shadow-orange-500/20">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-semibold text-[#0B192C] dark:text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-[#0B192C]/70 dark:text-gray-400">
              <li><Link to="/features" className="hover:text-[#F97316] transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-[#F97316] transition-colors">Pricing</Link></li>
              <li><Link to="/explore" className="hover:text-[#F97316] transition-colors">Explore Blogs</Link></li>
              <li><Link to="/changelog" className="hover:text-[#F97316] transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-semibold text-[#0B192C] dark:text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-[#0B192C]/70 dark:text-gray-400">
              <li><Link to="/community" className="hover:text-[#F97316] transition-colors">Community</Link></li>
              <li><Link to="/docs" className="hover:text-[#F97316] transition-colors">Documentation</Link></li>
              <li><Link to="/support" className="hover:text-[#F97316] transition-colors">Help Center</Link></li>
              <li><Link to="/api" className="hover:text-[#F97316] transition-colors">API Reference</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-semibold text-[#0B192C] dark:text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-[#0B192C]/70 dark:text-gray-400">
              <li><Link to="/privacy" className="hover:text-[#F97316] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#F97316] transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-[#F97316] transition-colors">Cookie Policy</Link></li>
              <li><Link to="/contact" className="hover:text-[#F97316] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Icons */}
        <div className="pt-8 border-t border-[#0B192C]/10 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#0B192C]/60 dark:text-gray-500">
            © {new Date().getFullYear()} WriteSpace. All rights reserved.
          </p>
          
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-[#15233B] text-[#0B192C] dark:text-gray-400 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-[#15233B] text-[#0B192C] dark:text-gray-400 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-[#15233B] text-[#0B192C] dark:text-gray-400 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}