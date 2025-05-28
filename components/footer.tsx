import { Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:contact@postly.com" className="hover:text-blue-400 transition-colors duration-300">
                contact@postly.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors duration-300">
                +1 (234) 567-890
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-400 dark:text-gray-500">© 2024 Postly. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
