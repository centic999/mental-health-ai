import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkzupvorbamgkkqimuwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprenVwdm9yYmFtZ2trcWltdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Nzg4ODIsImV4cCI6MjA2MzM1NDg4Mn0.uUNY76iepanmNv3-Dy3MpWH-Qd-iqgF1E6OxEdRLRkE';
export const supabase = createClient(supabaseUrl, supabaseKey);
