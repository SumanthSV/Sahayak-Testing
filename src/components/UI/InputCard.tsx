import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface InputFieldProps {
  label: string;
  icon?: React.ComponentType<any>;
  tooltip?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  tooltip,
  children,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

interface InputCardProps {
  title: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  icon: Icon,
  children,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-6">
        {Icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
};