import { useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { t } from '../../utils/translations';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  PhotoIcon, 
  EnvelopeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, language, toggleLanguage, themeColors } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: t('nav.home', language), href: '/', icon: HomeIcon },
    { name: t('nav.services', language), href: '/services', icon: BriefcaseIcon },
    { name: t('nav.portfolio', language), href: '/portfolio', icon: PhotoIcon },
    { name: t('nav.contact', language), href: '/contact', icon: EnvelopeIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-bg-night/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-day to-primary-night flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span 
              className="text-2xl font-bold transition-colors"
              style={{ color: themeColors.brandName }}
            >
              {t('brand.name', language)}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-day/10 dark:bg-primary-night/10 text-primary-dark' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDarkMode ? t('common.dayTheme', language) : t('common.nightTheme', language)}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-1"
              aria-label={t('common.language', language)}
            >
              <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* User Menu */}
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-day to-primary-night flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                </Menu.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 rounded-lg bg-white dark:bg-bg-card-night shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                    <div className="p-1">
                      {!user.profile_completed && (
                        <div className="px-3 py-2 mb-1 bg-warning/10 rounded-md">
                          <p className="text-xs text-warning">
                            {t('profile.completionBanner', language)}
                          </p>
                        </div>
                      )}
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard"
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-800' : ''
                            } flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>{t('nav.dashboard', language)}</span>
                          </Link>
                        )}
                      </Menu.Item>
                      
                      {user.is_admin && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-800' : ''
                              } flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                            >
                              <Cog6ToothIcon className="w-4 h-4" />
                              <span>{t('nav.admin', language)}</span>
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-800' : ''
                            } flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span>{t('nav.logout', language)}</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('nav.login', language)}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-day to-primary-dark hover:from-primary-dark hover:to-primary-day rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {t('nav.register', language)}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="md:hidden bg-white dark:bg-bg-night border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-day/10 dark:bg-primary-night/10 text-primary-dark' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{t('nav.login', language)}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-white bg-gradient-to-r from-primary-day to-primary-dark rounded-lg"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{t('nav.register', language)}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;