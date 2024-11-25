import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Book, Settings, Languages, Users, UserCircle, Brain, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import MatrixChat from './MatrixChat';

const navigation = {
  en: [
    { name: 'Home', to: '/', icon: Book },
    { name: 'Learn', to: '/learn', icon: Book },
    { name: 'Residents', to: '/residents', icon: UserCircle },
    { name: 'Groups', to: '/groups', icon: Users },
    { name: 'LLM Models', to: '/models', icon: Brain },
    { name: 'Settings', to: '/settings', icon: Settings },
  ],
  zh: [
    { name: '主页', to: '/', icon: Book },
    { name: '学习', to: '/learn', icon: Book },
    { name: '居民', to: '/residents', icon: UserCircle },
    { name: '群组', to: '/groups', icon: Users },
    { name: 'LLM 模型', to: '/models', icon: Brain },
    { name: '设置', to: '/settings', icon: Settings },
  ],
};

export default function Sidebar() {
  const { language, setLanguage } = useLanguage();
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-4 py-6 flex flex-col h-screen">
      <div className="flex items-center mb-8 px-2">
        <img src="/src/assets/bihua.png" alt="Bihua" className="h-8 w-8" />
        <span className="ml-2 text-2xl font-bold text-gray-900">
          {language === 'en' ? 'Bihua' : '笔画'}
        </span>
      </div>

      {!isLoginPage && isAuthenticated && (
        <>
          <nav className="space-y-2">
            {navigation[language].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md w-full mb-2"
            >
              <Languages className="mr-3 h-5 w-5" />
              {language === 'en' ? 'Switch to 中文' : 'Switch to English'}
            </button>

            <button
              onClick={logout}
              className="flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md w-full mb-4"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {language === 'en' ? 'Sign out' : '退出登录'}
            </button>

            <MatrixChat />
          </div>
        </>
      )}

      {isLoginPage && (
        <div className="mt-auto">
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md w-full"
          >
            <Languages className="mr-3 h-5 w-5" />
            {language === 'en' ? 'Switch to 中文' : 'Switch to English'}
          </button>
        </div>
      )}
    </div>
  );
}