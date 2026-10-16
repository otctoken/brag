import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeenPatti from '../../src/components/TeenPatti';
import '../../src/App.css';
import { state } from './state';
const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
(window as any).__bragTest={state,refresh:()=>client.invalidateQueries()};
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><div style={{maxWidth:1200,margin:'0 auto',padding:12}}><TeenPatti onGetbalan={()=>{}} /></div></QueryClientProvider>);
