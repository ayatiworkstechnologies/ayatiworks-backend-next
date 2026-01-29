'use client';

import { useState } from 'react';
import Button from './Button';
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <HiOutlineExclamation className="w-8 h-8 text-red-600" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title || 'Confirm Delete'}</h3>
          <p className="text-gray-600">
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={onConfirm} 
            className="flex-1 !bg-red-600 hover:!bg-red-700"
            loading={loading}
          >
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
