"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Send, Calendar, Clock, User as UserIcon, Building2, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { apiCall } from '@/utils/apiUtils';
import { LeadDTO } from '@/types/lead.types';
import { useToast } from '@/components/admin/ui/Toast';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import { Select } from '@/components/admin/ui/forms/Select';
import { Textarea } from '@/components/admin/ui/forms/Textarea';
import { useAuth } from '@/hooks/useAuth';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const id = params?.id as string;
  const [lead, setLead] = useState<LeadDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState<"NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED">('NEW');

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await apiCall<{success: boolean; data: LeadDTO}>(`/api/leads/${id}`);
      if (res.success && res.data) {
        setLead(res.data);
        setStatus(res.data.status);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch lead', 'error');
      router.push('/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const handleUpdateStatus = async (newStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED") => {
    setStatus(newStatus);
    try {
      const res = await apiCall(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        showToast('Status updated successfully', 'success');
        setLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return;
    
    setUpdating(true);
    try {
      const authorName = user?.email?.split('@')[0] || 'Unknown';
      const updatedNotes = [
        ...(lead.notes || []), 
        { content: newNote.trim(), author: authorName, createdAt: new Date().toISOString() }
      ];

      const res = await apiCall(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: updatedNotes })
      });

      if (res.success) {
        showToast('Note added successfully', 'success');
        setNewNote('');
        setLead(prev => prev ? { ...prev, notes: updatedNotes } : null);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to add note', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-12">
      <Breadcrumb />
      
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex items-center">
            <button onClick={() => router.push('/admin/leads')} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lead.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Submitted on {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-48">
              <Select
                label=""
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value as any)}
                options={[
                  { label: 'New', value: 'NEW' },
                  { label: 'Contacted', value: 'CONTACTED' },
                  { label: 'Qualified', value: 'QUALIFIED' },
                  { label: 'Closed', value: 'CLOSED' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Col */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contact Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 flex items-center"><Mail className="w-4 h-4 mr-2"/> Email</span>
                  <p className="font-medium text-gray-900 dark:text-white"><a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a></p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 flex items-center"><Phone className="w-4 h-4 mr-2"/> Phone</span>
                  <p className="font-medium text-gray-900 dark:text-white"><a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">{lead.phone}</a></p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 flex items-center"><Building2 className="w-4 h-4 mr-2"/> Company</span>
                  <p className="font-medium text-gray-900 dark:text-white">{lead.companyName || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-500 flex items-center"><Globe className="w-4 h-4 mr-2"/> IP Address</span>
                  <p className="font-medium text-gray-900 dark:text-white">{lead.ipAddress}</p>
                </div>
              </div>
            </div>

            {/* Message Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Message Content</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </p>
              </div>
            </div>
            
          </div>

          {/* Sidebar - Right Col (Notes) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Internal Notes</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
                {!lead.notes || lead.notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8 italic">No notes added yet.</p>
                ) : (
                  lead.notes.map((note, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{note.author}</span>
                        <span className="text-[10px] text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(note.createdAt || new Date()).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Textarea 
                  label=""
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={updating || !newNote.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
