'use client';

import { useState } from 'react';
import { Phone, Facebook, Mail, MessageCircle, X, MessagesSquare } from 'lucide-react';

export default function ContactButtons() {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    {
      href: "tel:1800282279",
      icon: Phone,
      title: "Gọi điện",
      bgColor: "bg-gradient-to-r from-green-400 to-green-600",
      hoverColor: "hover:from-green-500 hover:to-green-700",
      delay: "delay-75"
    },
    {
      href: "https://zalo.me/0339042666",
      icon: MessageCircle,
      title: "Chat Zalo",
      bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
      hoverColor: "hover:from-blue-500 hover:to-blue-700",
      delay: "delay-150",
      target: "_blank"
    },
    {
      href: "https://www.facebook.com/nestyvnshoes",
      icon: Facebook,
      title: "Messenger",
      bgColor: "bg-gradient-to-r from-indigo-400 to-indigo-600",
      hoverColor: "hover:from-indigo-500 hover:to-indigo-700",
      delay: "delay-225",
      target: "_blank"
    },
    {
      href: "mailto:marketing@taiyangshoes.com.vn",
      icon: Mail,
      title: "Email",
      bgColor: "bg-gradient-to-r from-gray-400 to-gray-600",
      hoverColor: "hover:from-gray-500 hover:to-gray-700",
      delay: "delay-300"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop blur when expanded */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact buttons container */}
      <div className="relative flex flex-col items-end gap-4">

        {/* Individual contact buttons */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-500 ease-out transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
          }`}>
          {contacts.map((contact, index) => {
            const IconComponent = contact.icon;
            return (
              <div
                key={index}
                className={`transform transition-all duration-300 ${contact.delay} ${isOpen ? 'translate-x-0 scale-100' : 'translate-x-8 scale-75'
                  }`}
              >
                <div className="flex items-center gap-3 group">
                  {/* Tooltip */}
                  <div className={`px-3 py-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 text-sm font-medium text-gray-800 whitespace-nowrap transform transition-all duration-200 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                    } group-hover:scale-105`}>
                    {contact.title}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white/90 rotate-45 border-r border-b border-white/20" />
                  </div>

                  {/* Contact button */}
                  <a
                    href={contact.href}
                    target={contact.target}
                    className={`relative w-14 h-14 flex items-center justify-center ${contact.bgColor} ${contact.hoverColor} text-white rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1 group-hover:rotate-6`}
                    title={contact.title}
                  >
                    <IconComponent size={20} className="relative z-10" />

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-white/20 scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main toggle button with contact icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-orange-300 via-orange-700 to-amber-600 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl group ${isOpen ? 'rotate-45 scale-105' : 'hover:-translate-y-1'
            }`}
        >
          <div className={`transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? <X size={24} /> : <MessagesSquare size={22} />}
          </div>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 animate-ping opacity-20" />

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}