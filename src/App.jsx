import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast';

// --- SHARED CORE PLATFORM LAYOUT COMPONENTS ---
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';

// --- ACTIVE APPLICATION DASHBOARD VIEWS ---
import LoginPage from './views/LoginPage';
import DashboardView from './views/DashboardView';
import AttendanceView from './views/AttendanceView';
import TasksView from './views/TasksView';
import ContributionsView from './views/ContributionsView';
import LeaveView from './views/LeaveView';
import PerformanceReviewView from './views/PerformanceReviewView';
import SettingsView from './views/SettingsView';

/**
 * UTILITY CORE COMPONENT: MainContent
 * PURPOSE: Internal view routing engine selecting active display windows 
 * based on the active selection state within the sidebar panel navigation.
 */
const MainContent = ({ view, userProfile, ...props }) => {
  switch (view) {
    case 'dashboard':
      return <DashboardView {...props} userProfile={userProfile} />;
    case 'attendance':
      return <AttendanceView {...props} userProfile={userProfile} />;
    case 'tasks':
      return <TasksView {...props} userProfile={userProfile} createNotification={props.createNotification} />;
    case 'contributions':
      return <ContributionsView {...props} userProfile={userProfile} />;
    case 'leave':
      return <LeaveView {...props} userProfile={userProfile} createNotification={props.createNotification} fetchProfile={props.fetchProfile} />;
    case 'reviews':
      return <PerformanceReviewView {...props} userProfile={userProfile} />;
    case 'settings':
      return <SettingsView userProfile={userProfile} fetchProfile={props.fetchProfile} />;
    default:
      return <DashboardView {...props} userProfile={userProfile} />;
  }
};

export default function App() {
  // --- ROOT RUNTIME AND ACCESS SYSTEM STATES ---
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Manages responsive mobile layout drawer overlays

  // --- RESPONSIVE PLATFORM THEME MODE STATE CONTROLLER ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Automatically manages class list updates on the root document node to maintain dark style sheets
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // --- DYNAMIC RUNTIME DATA STREAM STORAGE MATRICES ---
  const [allUsers, setAllUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);

  /**
   * DATA PIPELINE CONTROLLER: createNotification
   * PURPOSE: Writes transactional alert messages into the database system.
   * REFACTOR SECURITY LAYER: Executes lookahead filter blocks to prevent identical notification inserts.
   */
  const createNotification = async (userId, message) => {
    try {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('message', message)
        .maybeSingle();

      if (existing) return; // Drop execution if item signature matches past entries

      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        message,
        read: false,
        created_at: new Date().toISOString(),
      });

      if (error) console.error('Notification write fault:', error);
    } catch (err) {
      console.error('Unexpected tracking alert pipeline break:', err);
    }
  };

  // =========================================================================
  // 🔌 SUPABASE BULK FEED RETRIEVAL AGGREGATOR CHANNELS
  // =========================================================================

  const fetchProfile = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error) setUserProfile(data);
    else console.error('Profile query exception:', error);
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error) setAllUsers(data || []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (!error) setTasks(data || []);
  };

  const fetchAttendance = async (profile) => {
    if (!profile) return;
    let query = supabase.from('attendance').select('*');
    // Role Gate Isolation: Interns match personal tracking rows only; supervisors track universally
    if (profile.role !== 'supervisor') query = query.eq('employee_id', profile.id);
    const { data, error } = await query.order('date', { ascending: false });
    if (!error) setAttendance(data || []);
  };

  const fetchLeaveRequests = async (profile) => {
    if (!profile) return;
    let query = supabase.from('leave_requests').select('*');
    if (profile.role !== 'supervisor') query = query.eq('employee_id', profile.id);
    const { data, error } = await query.order('start_date', { ascending: false });
    if (!error) setLeaveRequests(data || []);
  };

  const fetchContributions = async (profile) => {
    if (!profile) return;
    // Shared Timeline Feed: Displays global discussion boards uniformly for all authenticated profiles
    const { data, error } = await supabase.from('contributions').select('*').order('date', { ascending: false });
    if (!error) setContributions(data || []);
  };

  /**
   * PIPELINE CORRECTION: fetchReviews
   * FIXED: Realigned query schema target to point to 'performance_evaluations' 
   * to fix blank data states on layout scorecards.
   */
  const fetchReviews = async (profile) => {
    if (!profile) return;
    let query = supabase.from('performance_evaluations').select('*'); // FIXED TABLE REFERENCE
    if (profile.role !== 'supervisor') query = query.eq('employee_id', profile.id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) setReviews(data || []);
    else console.error('Framework evaluations data loop exception:', error);
  };

  const fetchNotifications = async (profile) => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
  };

  // =========================================================================
  // ⚡ AUTOMATED LIFECYCLE LISTENERS & COMPLIANCE CHANNELS
  // =========================================================================

  // Coordinates token state distributions on session initialization or updates
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else {
        // State Flush: Completely wipe memory frames on session close to protect local caches
        setUserProfile(null);
        setTasks([]);
        setAttendance([]);
        setLeaveRequests([]);
        setContributions([]);
        setNotifications([]);
        setAllUsers([]);
        setReviews([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hydrates dashboard data streams immediately upon verified profile assembly
  useEffect(() => {
    if (userProfile) {
      fetchTasks();
      fetchAttendance(userProfile);
      fetchLeaveRequests(userProfile);
      fetchContributions(userProfile);
      fetchNotifications(userProfile);
      fetchReviews(userProfile);
      fetchAllUsers(); 
    }
  }, [userProfile]);

  // LIVE WEB-SOCKET COMPLIANCE LISTENER FEEDBACK CHANNEL
  useEffect(() => {
    if (!userProfile) return;

    const handleChanges = (payload) => {
      switch (payload.table) {
        case 'tasks': fetchTasks(); break;
        case 'notifications': if (payload.new?.user_id === userProfile.id) fetchNotifications(userProfile); break;
        case 'performance_evaluations': fetchReviews(userProfile); break; // FIXED REAL-TIME INTERACTION SIGNATURES
        default: break;
      }
    };

    const channel = supabase
      .channel(`realtime_feed_node_${userProfile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, handleChanges)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userProfile]);

  // Welcome message toaster hook
  const hasWelcomed = useRef(false);
  useEffect(() => {
    if (!userProfile || hasWelcomed.current) return;
    const lastWelcome = localStorage.getItem('lastWelcomeDate');
    const today = new Date().toISOString().split('T')[0];
    if (lastWelcome === today) return;
    toast.success(`Welcome back, ${userProfile.name || 'User'}! 👋`);
    hasWelcomed.current = true;
    localStorage.setItem('lastWelcomeDate', today);
  }, [userProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNotificationsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    setNotifications(current => current.map(n => (unreadIds.includes(n.id) ? { ...n, read: true } : n)));
    const { error } = await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    if (error) console.error('Notification state flush fault:', error);
  };

  // Pre-render access loading screen mask while auth configurations resolve
  if (session === null || (session && userProfile === null)) {
    if (session && !userProfile) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="h-12 w-12 bg-gray-200 rounded-full dark:bg-gray-700"></div>
             <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      );
    }
    return <LoginPage />;
  }

  // =========================================================================
  // 💻 CENTRAL GRID LAYOUT STRUCTURE PROFILE
  // =========================================================================
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-700 dark:text-white' }} />
      
      {/* GLOBAL VIEW NAVIGATION COLUMN FRAME */}
      <Sidebar 
          userProfile={userProfile} 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isMobileOpen={isMobileOpen}       
          setIsMobileOpen={setIsMobileOpen}
      />

      {/* VIEWPORT CONTEXT CONTAINER WRAPPER */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 relative min-h-screen w-full">
          
          <Header
            userProfile={userProfile}
            onLogout={handleLogout}
            notifications={notifications}
            tasks={tasks} 
            onNotificationsRead={handleNotificationsRead}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} 
          />

          {/* PLAYGROUND MOUNT REGION CHANNELS */}
          <main className="flex-1 overflow-y-auto p-0 relative">
            <MainContent
              view={activeView}
              userProfile={userProfile}
              allUsers={allUsers}
              tasks={tasks}
              fetchTasks={fetchTasks}
              attendance={attendance}
              fetchAttendance={() => fetchAttendance(userProfile)}
              leaveRequests={leaveRequests}
              fetchLeaveRequests={() => fetchLeaveRequests(userProfile)}
              contributions={contributions}
              fetchContributions={() => fetchContributions(userProfile)}
              fetchProfile={() => fetchProfile(userProfile.id)}
              createNotification={createNotification}
              reviews={reviews}
            />
            
            {/* Intelligent Agent Companion Overlay */}
            <ChatBot userProfile={userProfile} tasks={tasks} />
          </main>

          {/* ARCHITECTURE STRUCTURAL ANCHORED FOOTER */}
          <div className="px-6 lg:px-8 pb-4 shrink-0">
             <Footer />
          </div>

      </div>
    </div>
  );
}