// Comprehensive translations for Arabic and English
export const translations = {
  ar: {
    // Navigation
    nav: {
      home: 'الرئيسية',
      services: 'الخدمات',
      portfolio: 'الأعمال',
      contact: 'تواصل معنا',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      dashboard: 'لوحة التحكم',
      admin: 'لوحة الإدارة',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
    },
    
    // Brand
    brand: {
      name: 'ناوي',
      tagline: 'فريق التصميم اللي بيحوّل فكرتك لهوية',
      description: 'استوديو تصميم إبداعي متخصص في بناء الهوية البصرية',
    },
    
    // Home Page
    home: {
      hero: {
        title: 'نحول أفكارك إلى تصاميم إبداعية',
        subtitle: 'فريق من المصممين المحترفين لخدمة مشروعك',
        cta: 'ابدأ مشروعك',
        explore: 'استكشف أعمالنا',
      },
      stats: {
        projects: 'مشروع منجز',
        clients: 'عميل سعيد',
        designs: 'تصميم مبتكر',
        experience: 'سنوات خبرة',
      },
    },
    
    // Services
    services: {
      title: 'خدماتنا',
      subtitle: 'نقدم حلول تصميم شاملة لتلبية احتياجاتك',
      requestDesign: 'اطلب تصميم',
      viewDetails: 'عرض التفاصيل',
    },
    
    // Portfolio
    portfolio: {
      title: 'معرض الأعمال',
      subtitle: 'اكتشف أحدث مشاريعنا الإبداعية',
      categories: {
        all: 'الكل',
        branding: 'الهوية البصرية',
        social: 'السوشيال ميديا',
        print: 'المطبوعات',
        web: 'تصميم المواقع',
      },
      client: 'العميل',
      category: 'التصنيف',
      viewProject: 'عرض المشروع',
    },
    
    // Contact
    contact: {
      title: 'تواصل معنا',
      subtitle: 'نحن هنا لمساعدتك في مشروعك القادم',
      form: {
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        subject: 'الموضوع',
        message: 'الرسالة',
        phone: 'رقم الهاتف (اختياري)',
        attachment: 'إرفاق ملف (اختياري)',
        submit: 'إرسال الرسالة',
        submitting: 'جاري الإرسال...',
        success: 'تم إرسال رسالتك بنجاح!',
        error: 'حدث خطأ في الإرسال. حاول مرة أخرى.',
      },
      info: {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
        workHours: 'ساعات العمل',
        response: 'سنرد عليك خلال 48 ساعة',
      },
    },
    
    // Authentication
    auth: {
      login: {
        title: 'تسجيل الدخول',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        rememberMe: 'تذكرني',
        forgotPassword: 'نسيت كلمة المرور؟',
        submit: 'دخول',
        googleSignIn: 'الدخول بحساب جوجل',
        noAccount: 'ليس لديك حساب؟',
        signUp: 'سجل الآن',
      },
      register: {
        title: 'إنشاء حساب جديد',
        username: 'اسم المستخدم',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        userType: 'نوع الحساب',
        types: {
          student: 'طالب',
          teacher: 'معلم',
          contentCreator: 'صانع محتوى',
          company: 'شركة',
          other: 'أخرى',
        },
        submit: 'إنشاء الحساب',
        googleSignUp: 'التسجيل بحساب جوجل',
        hasAccount: 'لديك حساب بالفعل؟',
        signIn: 'سجل دخول',
      },
    },
    
    // User Profile
    profile: {
      title: 'الملف الشخصي',
      completeProfile: 'أكمل ملفك الشخصي',
      completionBanner: 'يرجى إكمال إعدادات حسابك',
      fields: {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        major: 'التخصص',
        year: 'السنة الدراسية',
        classes: 'الفصول',
        subject: 'المادة التي تدرسها',
        level: 'المستوى',
        contentType: 'نوع المحتوى',
        channels: 'روابط القنوات',
        companyName: 'اسم الشركة',
        role: 'المنصب',
        website: 'الموقع الإلكتروني',
        portfolio: 'معرض الأعمال',
        languages: 'اللغات',
        socials: 'وسائل التواصل',
      },
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
    },
    
    // Design Request
    designRequest: {
      title: 'اطلب تصميمك',
      subtitle: 'اختر نوع التصميم والمقاسات المطلوبة',
      presets: {
        title: 'قوالب جاهزة',
        facebook: {
          post: 'منشور فيسبوك',
          cover: 'غلاف فيسبوك',
        },
        instagram: {
          post: 'منشور انستجرام',
          story: 'ستوري انستجرام',
        },
        youtube: {
          thumbnail: 'صورة مصغرة يوتيوب',
          banner: 'غلاف قناة يوتيوب',
        },
        whatsapp: {
          profile: 'صورة واتساب الشخصية',
        },
        twitter: {
          post: 'منشور تويتر',
        },
        custom: 'مقاس مخصص',
      },
      dimensions: {
        width: 'العرض',
        height: 'الطول',
        unit: 'بكسل',
      },
      options: {
        includeSource: 'تضمين الملف المصدر (PSD/AI)',
        expedited: 'تسليم سريع',
        format: 'صيغة الملف',
        dpi: 'الجودة (DPI)',
        maxSize: 'الحد الأقصى للحجم',
      },
      upload: {
        title: 'رفع الملفات',
        description: 'ملف مرجعي أو شعار',
        dragDrop: 'اسحب وأفلت الملفات هنا أو',
        browse: 'تصفح',
      },
      submit: 'إرسال الطلب',
      cancel: 'إلغاء',
    },
    
    // Admin Dashboard
    admin: {
      title: 'لوحة الإدارة',
      menu: {
        overview: 'نظرة عامة',
        users: 'المستخدمين',
        requests: 'طلبات التصميم',
        portfolio: 'معرض الأعمال',
        content: 'المحتوى',
        settings: 'الإعدادات',
        reports: 'التقارير',
      },
      stats: {
        totalUsers: 'إجمالي المستخدمين',
        newRequests: 'طلبات جديدة',
        completedProjects: 'مشاريع مكتملة',
        revenue: 'الإيرادات',
      },
      users: {
        title: 'إدارة المستخدمين',
        search: 'بحث عن مستخدم...',
        filter: 'تصفية حسب النوع',
        export: 'تصدير CSV',
        actions: 'الإجراءات',
        viewProfile: 'عرض الملف',
        edit: 'تعديل',
        ban: 'حظر',
        unban: 'إلغاء الحظر',
        delete: 'حذف',
        phoneVisible: 'رقم الهاتف (مخفي للمستخدمين)',
      },
      requests: {
        title: 'طلبات التصميم',
        status: {
          new: 'جديد',
          inProgress: 'قيد التنفيذ',
          completed: 'مكتمل',
          delivered: 'تم التسليم',
        },
        approve: 'موافقة',
        reject: 'رفض',
        assignDesigner: 'تعيين مصمم',
        attachFiles: 'إرفاق ملفات',
      },
      settings: {
        title: 'إعدادات النظام',
        theme: 'المظهر',
        particles: 'تأثيرات الخلفية',
        maxParticles: 'الحد الأقصى للجزيئات',
        particlesPerSecond: 'جزيئات في الثانية',
        decayTime: 'وقت الاضمحلال',
        reduceMotion: 'تقليل الحركة',
        emailConfig: 'إعدادات البريد',
        googleOAuth: 'مفاتيح Google OAuth',
      },
    },
    
    // Common
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تم بنجاح',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      download: 'تحميل',
      upload: 'رفع',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      next: 'التالي',
      previous: 'السابق',
      yes: 'نعم',
      no: 'لا',
      confirm: 'تأكيد',
      close: 'إغلاق',
      select: 'اختر',
      all: 'الكل',
      none: 'لا شيء',
      optional: 'اختياري',
      required: 'مطلوب',
      dayTheme: 'الوضع النهاري',
      nightTheme: 'الوضع الليلي',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'English',
    },
    
    // Footer
    footer: {
      rights: 'جميع الحقوق محفوظة',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      followUs: 'تابعنا',
    },
  },
  
  en: {
    // Navigation
    nav: {
      home: 'Home',
      services: 'Services',
      portfolio: 'Portfolio',
      contact: 'Contact',
      login: 'Login',
      register: 'Sign Up',
      dashboard: 'Dashboard',
      admin: 'Admin Panel',
      logout: 'Logout',
      profile: 'Profile',
    },
    
    // Brand
    brand: {
      name: 'Nawi',
      tagline: 'The design team that transforms your idea into identity',
      description: 'Creative design studio specialized in brand identity',
    },
    
    // Home Page
    home: {
      hero: {
        title: 'We Turn Your Ideas Into Creative Designs',
        subtitle: 'Professional designers team to serve your project',
        cta: 'Start Your Project',
        explore: 'Explore Our Work',
      },
      stats: {
        projects: 'Completed Projects',
        clients: 'Happy Clients',
        designs: 'Creative Designs',
        experience: 'Years of Experience',
      },
    },
    
    // Services
    services: {
      title: 'Our Services',
      subtitle: 'We provide comprehensive design solutions to meet your needs',
      requestDesign: 'Request Design',
      viewDetails: 'View Details',
    },
    
    // Portfolio
    portfolio: {
      title: 'Portfolio',
      subtitle: 'Discover our latest creative projects',
      categories: {
        all: 'All',
        branding: 'Branding',
        social: 'Social Media',
        print: 'Print',
        web: 'Web Design',
      },
      client: 'Client',
      category: 'Category',
      viewProject: 'View Project',
    },
    
    // Contact
    contact: {
      title: 'Contact Us',
      subtitle: 'We\'re here to help with your next project',
      form: {
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        phone: 'Phone (Optional)',
        attachment: 'Attach File (Optional)',
        submit: 'Send Message',
        submitting: 'Sending...',
        success: 'Your message has been sent successfully!',
        error: 'Error sending message. Please try again.',
      },
      info: {
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        workHours: 'Work Hours',
        response: 'We\'ll reply within 48 hours',
      },
    },
    
    // Authentication
    auth: {
      login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        rememberMe: 'Remember Me',
        forgotPassword: 'Forgot Password?',
        submit: 'Login',
        googleSignIn: 'Sign in with Google',
        noAccount: 'Don\'t have an account?',
        signUp: 'Sign Up',
      },
      register: {
        title: 'Create New Account',
        username: 'Username',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        userType: 'Account Type',
        types: {
          student: 'Student',
          teacher: 'Teacher',
          contentCreator: 'Content Creator',
          company: 'Company',
          other: 'Other',
        },
        submit: 'Create Account',
        googleSignUp: 'Sign up with Google',
        hasAccount: 'Already have an account?',
        signIn: 'Sign In',
      },
    },
    
    // User Profile
    profile: {
      title: 'Profile',
      completeProfile: 'Complete Your Profile',
      completionBanner: 'Please complete your account settings',
      fields: {
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        major: 'Major',
        year: 'Academic Year',
        classes: 'Classes',
        subject: 'Subject Taught',
        level: 'Level',
        contentType: 'Content Type',
        channels: 'Channel Links',
        companyName: 'Company Name',
        role: 'Position',
        website: 'Website',
        portfolio: 'Portfolio',
        languages: 'Languages',
        socials: 'Social Media',
      },
      save: 'Save Changes',
      cancel: 'Cancel',
    },
    
    // Design Request
    designRequest: {
      title: 'Request Your Design',
      subtitle: 'Choose design type and required dimensions',
      presets: {
        title: 'Preset Templates',
        facebook: {
          post: 'Facebook Post',
          cover: 'Facebook Cover',
        },
        instagram: {
          post: 'Instagram Post',
          story: 'Instagram Story',
        },
        youtube: {
          thumbnail: 'YouTube Thumbnail',
          banner: 'YouTube Channel Art',
        },
        whatsapp: {
          profile: 'WhatsApp Profile',
        },
        twitter: {
          post: 'Twitter Post',
        },
        custom: 'Custom Size',
      },
      dimensions: {
        width: 'Width',
        height: 'Height',
        unit: 'pixels',
      },
      options: {
        includeSource: 'Include Source File (PSD/AI)',
        expedited: 'Expedited Delivery',
        format: 'File Format',
        dpi: 'Quality (DPI)',
        maxSize: 'Max File Size',
      },
      upload: {
        title: 'Upload Files',
        description: 'Reference file or logo',
        dragDrop: 'Drag and drop files here or',
        browse: 'Browse',
      },
      submit: 'Submit Request',
      cancel: 'Cancel',
    },
    
    // Admin Dashboard
    admin: {
      title: 'Admin Dashboard',
      menu: {
        overview: 'Overview',
        users: 'Users',
        requests: 'Design Requests',
        portfolio: 'Portfolio',
        content: 'Content',
        settings: 'Settings',
        reports: 'Reports',
      },
      stats: {
        totalUsers: 'Total Users',
        newRequests: 'New Requests',
        completedProjects: 'Completed Projects',
        revenue: 'Revenue',
      },
      users: {
        title: 'User Management',
        search: 'Search user...',
        filter: 'Filter by type',
        export: 'Export CSV',
        actions: 'Actions',
        viewProfile: 'View Profile',
        edit: 'Edit',
        ban: 'Ban',
        unban: 'Unban',
        delete: 'Delete',
        phoneVisible: 'Phone Number (Hidden from users)',
      },
      requests: {
        title: 'Design Requests',
        status: {
          new: 'New',
          inProgress: 'In Progress',
          completed: 'Completed',
          delivered: 'Delivered',
        },
        approve: 'Approve',
        reject: 'Reject',
        assignDesigner: 'Assign Designer',
        attachFiles: 'Attach Files',
      },
      settings: {
        title: 'System Settings',
        theme: 'Theme',
        particles: 'Background Effects',
        maxParticles: 'Max Particles',
        particlesPerSecond: 'Particles Per Second',
        decayTime: 'Decay Time',
        reduceMotion: 'Reduce Motion',
        emailConfig: 'Email Settings',
        googleOAuth: 'Google OAuth Keys',
      },
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      close: 'Close',
      select: 'Select',
      all: 'All',
      none: 'None',
      optional: 'Optional',
      required: 'Required',
      dayTheme: 'Day Mode',
      nightTheme: 'Night Mode',
      language: 'Language',
      arabic: 'العربية',
      english: 'English',
    },
    
    // Footer
    footer: {
      rights: 'All Rights Reserved',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      followUs: 'Follow Us',
    },
  },
};

// Helper function to get translation
export const t = (key, language = 'ar') => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      // Fallback to English if Arabic translation not found
      value = translations['en'];
      for (const k2 of keys) {
        if (value && typeof value === 'object') {
          value = value[k2];
        } else {
          return key; // Return key if translation not found
        }
      }
      return value;
    }
  }
  
  return value || key;
};