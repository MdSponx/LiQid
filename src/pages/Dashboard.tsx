import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Settings, Plus, UserPlus, Building, FileText, 
  Edit, MessageSquare, User, Users, Folder, BarChart2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Sidebar from '../components/Sidebar';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state for dashboard data
  const [stats, setStats] = useState([
    { title: 'Active Projects', value: 0, icon: <Folder size={18} className="text-[#E86F2C]" /> },
    { title: 'Scripts', value: 0, icon: <FileText size={18} className="text-[#E86F2C]" /> },
    { title: 'Collaborators', value: 0, icon: <Users size={18} className="text-[#E86F2C]" /> }
  ]);

  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Load dashboard data with optimized loading
  useEffect(() => {
    let isMounted = true;
    let projectsTimeout: number | undefined;
    let activitiesTimeout: number | undefined;
    
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }
        
        // Set a timeout to prevent UI freeze if projects query takes too long
        projectsTimeout = window.setTimeout(() => {
          if (isMounted && isLoading) {
            console.log('Projects query taking longer than expected, showing partial data');
            // Show empty projects but don't set loading to false yet
            setProjects([]);
          }
        }, 2000);
        
        // Fetch projects with a smaller limit initially
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', user.id),
          orderBy('updatedAt', 'desc'),
          limit(3)
        );

        try {
          const projectsSnapshot = await getDocs(projectsQuery);
          
          if (isMounted) {
            // Clear the timeout since we got the data
            if (projectsTimeout) {
              window.clearTimeout(projectsTimeout);
              projectsTimeout = undefined;
            }
            
            const projectsData = projectsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setProjects(projectsData);

            // Update stats
            setStats([
              { 
                title: 'Active Projects', 
                value: projectsData.length, 
                icon: <Folder size={18} className="text-[#E86F2C]" /> 
              },
              { 
                title: 'Scripts', 
                value: projectsData.reduce((acc, proj) => acc + ((proj as any).scenes || 0), 0), 
                icon: <FileText size={18} className="text-[#E86F2C]" /> 
              },
              { 
                title: 'Collaborators', 
                value: projectsData.reduce((acc, proj) => acc + ((proj as any).collaborators?.length || 0), 0), 
                icon: <Users size={18} className="text-[#E86F2C]" /> 
              }
            ]);
          }
        } catch (projectErr) {
          console.error('Error loading projects:', projectErr);
          if (isMounted) {
            // Still show the dashboard with empty projects
            setProjects([]);
          }
        }
        
        // Set a timeout for activities query
        activitiesTimeout = window.setTimeout(() => {
          if (isMounted && isLoading) {
            console.log('Activities query taking longer than expected, showing partial data');
            // Show empty activities and finish loading
            setActivities([]);
            setIsLoading(false);
          }
        }, 2000);
        
        // Fetch activities separately to avoid blocking the UI
        try {
          const activitiesQuery = query(
            collection(db, 'activities'),
            where('userId', '==', user.id),
            orderBy('timestamp', 'desc'),
            limit(5)
          );

          const activitiesSnapshot = await getDocs(activitiesQuery);
          
          if (isMounted) {
            // Clear the timeout since we got the data
            if (activitiesTimeout) {
              window.clearTimeout(activitiesTimeout);
              activitiesTimeout = undefined;
            }
            
            const activitiesData = activitiesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setActivities(activitiesData);
          }
        } catch (activitiesErr) {
          console.error('Error loading activities:', activitiesErr);
          if (isMounted) {
            // Still show the dashboard with empty activities
            setActivities([]);
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again.');
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();
    
    return () => {
      isMounted = false;
      if (projectsTimeout) window.clearTimeout(projectsTimeout);
      if (activitiesTimeout) window.clearTimeout(activitiesTimeout);
    };
  }, [user?.id, isLoading]);

  // Show loading state while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E4D3A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5F5F2] border-t-[#E86F2C] rounded-full animate-spin mb-4"></div>
          <p className="text-[#F5F5F2] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E4D3A]">
        <div className="text-center text-[#F5F5F2]">
          <div className="mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#E86F2C] rounded-lg hover:bg-[#E86F2C]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit size={18} className="text-blue-600 dark:text-blue-400" />;
      case 'join':
        return <UserPlus size={18} className="text-green-600 dark:text-green-400" />;
      case 'comment':
        return <MessageSquare size={18} className="text-purple-600 dark:text-purple-400" />;
      default:
        return <Edit size={18} />;
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F5F2] dark:bg-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="search"
                  placeholder={t('search_projects')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:border-[#E86F2C]"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Quick Actions */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('quick_actions')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/editor')}
                className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#E86F2C] dark:hover:border-[#E86F2C] transition-colors"
              >
                <div className="w-10 h-10 bg-[#E86F2C]/10 dark:bg-[#E86F2C]/20 rounded-lg flex items-center justify-center">
                  <Plus size={18} className="text-[#E86F2C]" />
                </div>
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">{t('new_project')}</span>
              </button>
              <button className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#E86F2C] dark:hover:border-[#E86F2C] transition-colors">
                <div className="w-10 h-10 bg-[#577B92]/10 dark:bg-[#577B92]/20 rounded-lg flex items-center justify-center">
                  <UserPlus size={18} className="text-[#577B92] dark:text-[#93c5fd]" />
                </div>
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">{t('invite_team')}</span>
              </button>
              <button className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#E86F2C] dark:hover:border-[#E86F2C] transition-colors">
                <div className="w-10 h-10 bg-[#1E4D3A]/10 dark:bg-[#1E4D3A]/20 rounded-lg flex items-center justify-center">
                  <Building size={18} className="text-[#1E4D3A] dark:text-[#6ee7b7]" />
                </div>
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">{t('manage_company')}</span>
              </button>
            </div>
          </section>

          {/* Recent Projects */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('recent_projects')}</h2>
              <Link to="/projects" className="text-[#E86F2C] hover:text-[#E86F2C]/80">
                {t('view_all')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[280px]"
                  onClick={() => navigate(`/editor?project=${project.id}`)}
                >
                  {/* Project content */}
                  <div className="relative flex-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                    {project.coverImage ? (
                      <img 
                        src={project.coverImage} 
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1E4D3A] to-[#577B92] flex items-center justify-center">
                        <FileText size={48} className="text-white/50" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/80">
                          {project.scenes} {t('scenes')}
                        </p>
                        <p className="text-sm text-white/80">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Collaborators */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.collaborators?.map((collaborator: any) => (
                        <img
                          key={collaborator.id}
                          src={collaborator.avatar}
                          alt="Collaborator"
                          className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      ))}
                    </div>
                    <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Feed */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('recent_activity')}</h2>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'edit' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : activity.type === 'join' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 dark:text-gray-100">
                      {activity.user} {activity.type === 'edit' && t('edited')}
                      {activity.type === 'join' && t('joined')}
                      {activity.type === 'comment' && t('commented')}
                      {activity.details && ` ${activity.details} ${t('in')}`}{' '}
                      <span className="font-medium">{activity.project}</span>
                    </p>
                    <p className="text-sm text-[#577B92] dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
