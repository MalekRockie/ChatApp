'use client';

import { useEffect } from 'react';
import supabase from '../lib/supabase';

export default function Home() {
  

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('User is logged in');
        window.location.href = '/rooms';
      } else {
        console.log('User is not logged in');
        window.location.href = '/login';
      }
    };
  
    checkAuthAndRedirect();
  }, []);
  
  return (
    <div>
      It logs in
    </div>
  );
}
