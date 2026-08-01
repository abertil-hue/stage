import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      nav: {
        title: "Algérie Télécom",
        subtitle: "Gestion des Formations",
        logout: "Déconnexion",
        dashboard: "Tableau de bord"
      },
      login: {
        title: "Espace Administration",
        subtitle: "Connectez-vous pour gérer les sessions et présences",
        emailLabel: "Adresse Email",
        emailPlaceholder: "exemple@algerietelecom.dz",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "••••••••",
        submitButton: "Se connecter",
        submitting: "Connexion en cours...",
        errorInvalid: "Identifiants invalides. Veuillez réessayer."
      },
      dashboard: {
        title: "Formations & Workshops",
        subtitle: "Gérez vos sessions de formation et suivez les émargements",
        searchPlaceholder: "Rechercher par titre, formateur ou lieu...",
        createButton: "Nouvelle Session",
        noSessions: "Aucune session de formation trouvée.",
        modalTitle: "Créer une nouvelle session",
        form: {
          titleLabel: "Titre de la formation",
          titlePlaceholder: "ex: Formation Cybersécurité & Cloud",
          trainerLabel: "Formateur / Intervenant",
          trainerPlaceholder: "ex: Ing. Ahmed Benali",
          dateLabel: "Date et Heure",
          locationLabel: "Lieu / Salle",
          locationPlaceholder: "ex: Salle de Conférence - Direction Générale",
          descriptionLabel: "Description",
          descriptionPlaceholder: "Détails et objectifs de la session...",
          submit: "Créer la session",
          submitting: "Création...",
          cancel: "Annuler"
        }
      },
      session: {
        backButton: "Retour au tableau de bord",
        detailsTitle: "Détails de la session",
        date: "Date",
        trainer: "Formateur",
        location: "Lieu",
        totalAttendees: "Total Émargés",
        presentCount: "Présents",
        absentCount: "Absents",
        qrTitle: "Code QR d'émargement",
        qrSubtitle: "Scannez ce code ou partagez le lien pour emarger",
        copyLink: "Copier le lien",
        linkCopied: "Lien copié !",
        exportPdf: "Exporter en PDF",
        attendeesList: "Registre des Présences",
        emptyAttendees: "Aucun émargement enregistré pour le moment.",
        columns: {
          name: "Nom & Prénom",
          email: "Email",
          phone: "Téléphone",
          status: "Statut",
          reason: "Motif d'absence",
          time: "Heure d'enregistrement"
        },
        statusPresent: "Présent(e)",
        statusAbsent: "Absent(e)"
      },
      attend: {
        badge: "Algérie Télécom - Émargement",
        title: "Feuille d'émargement",
        subtitle: "Veuillez remplir le formulaire pour valider votre présence",
        nameLabel: "Nom et Prénom",
        namePlaceholder: "ex: Karim Mansouri",
        emailLabel: "Adresse Email",
        emailPlaceholder: "ex: karim.m@algerietelecom.dz",
        phoneLabel: "Numéro de Téléphone",
        phonePlaceholder: "ex: 0661XX XX XX",
        statusLabel: "Votre Statut",
        presentOption: "Présent(e)",
        absentOption: "Absent(e)",
        reasonLabel: "Motif d'absence",
        reasonPlaceholder: "Précisez la raison de votre absence...",
        submitButton: "Valider mon émargement",
        submitting: "Enregistrement en cours...",
        successTitle: "Émargement enregistré !",
        successMessage: "Merci. Votre présence a bien été enregistrée dans le système.",
        alreadySubmittedTitle: "Déjà enregistré",
        alreadySubmittedMessage: "Vous avez déjà soumis votre émargement pour cette session."
      }
    }
  },
  en: {
    translation: {
      nav: {
        title: "Algérie Télécom",
        subtitle: "Training Management",
        logout: "Logout",
        dashboard: "Dashboard"
      },
      login: {
        title: "Admin Portal",
        subtitle: "Log in to manage training sessions and attendance",
        emailLabel: "Email Address",
        emailPlaceholder: "example@algerietelecom.dz",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        submitButton: "Log In",
        submitting: "Logging in...",
        errorInvalid: "Invalid credentials. Please try again."
      },
      dashboard: {
        title: "Training & Workshops",
        subtitle: "Manage training sessions and track participant attendance",
        searchPlaceholder: "Search by title, trainer, or location...",
        createButton: "New Session",
        noSessions: "No training sessions found.",
        modalTitle: "Create New Session",
        form: {
          titleLabel: "Session Title",
          titlePlaceholder: "e.g., Cybersecurity & Cloud Training",
          trainerLabel: "Trainer / Speaker",
          trainerPlaceholder: "e.g., Eng. Ahmed Benali",
          dateLabel: "Date & Time",
          locationLabel: "Location / Room",
          locationPlaceholder: "e.g., Main HQ Conference Room",
          descriptionLabel: "Description",
          descriptionPlaceholder: "Session details and objectives...",
          submit: "Create Session",
          submitting: "Creating...",
          cancel: "Cancel"
        }
      },
      session: {
        backButton: "Back to Dashboard",
        detailsTitle: "Session Details",
        date: "Date",
        trainer: "Trainer",
        location: "Location",
        totalAttendees: "Total Signed-in",
        presentCount: "Present",
        absentCount: "Absent",
        qrTitle: "Attendance QR Code",
        qrSubtitle: "Scan this code or share the link to mark attendance",
        copyLink: "Copy Link",
        linkCopied: "Link Copied!",
        exportPdf: "Export PDF",
        attendeesList: "Attendance Register",
        emptyAttendees: "No attendance records registered yet.",
        columns: {
          name: "Full Name",
          email: "Email",
          phone: "Phone",
          status: "Status",
          reason: "Absence Reason",
          time: "Timestamp"
        },
        statusPresent: "Present",
        statusAbsent: "Absent"
      },
      attend: {
        badge: "Algérie Télécom - Attendance",
        title: "Attendance Register",
        subtitle: "Please fill out the form to confirm your attendance",
        nameLabel: "Full Name",
        namePlaceholder: "e.g., Karim Mansouri",
        emailLabel: "Email Address",
        emailPlaceholder: "e.g., karim.m@algerietelecom.dz",
        phoneLabel: "Phone Number",
        phonePlaceholder: "e.g., 0661XX XX XX",
        statusLabel: "Your Status",
        presentOption: "Present",
        absentOption: "Absent",
        reasonLabel: "Reason for Absence",
        reasonPlaceholder: "Specify your reason for absence...",
        submitButton: "Submit Attendance",
        submitting: "Submitting...",
        successTitle: "Attendance Registered!",
        successMessage: "Thank you. Your attendance has been successfully logged.",
        alreadySubmittedTitle: "Already Submitted",
        alreadySubmittedMessage: "You have already submitted your attendance for this session."
      }
    }
  },
  ar: {
    translation: {
      nav: {
        title: "اتصالات الجزائر",
        subtitle: "إدارة الدورات التدريبية",
        logout: "تسجيل الخروج",
        dashboard: "لوحة التحكم"
      },
      login: {
        title: "بوابة الإدارة",
        subtitle: "قم بتسجيل الدخول لإدارة الدورات وسجلات الحضور",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "example@algerietelecom.dz",
        passwordLabel: "كلمة المرور",
        passwordPlaceholder: "••••••••",
        submitButton: "تسجيل الدخول",
        submitting: "جاري الدخول...",
        errorInvalid: "بيانات الاعتماد غير صحيحة. يرجى المحاولة مرة أخرى."
      },
      dashboard: {
        title: "الدورات التدريبية وورش العمل",
        subtitle: "إدارة دورات التدريب ومتابعة تسجيلات الحضور",
        searchPlaceholder: "البحث حسب العنوان، المدرب أو المكان...",
        createButton: "دورة جديدة",
        noSessions: "لم يتم العثور على أي دورات تدريبية.",
        modalTitle: "إنشاء دورة تدريبية جديدة",
        form: {
          titleLabel: "عنوان الدورة",
          titlePlaceholder: "مثال: تدريب الأمن السيبراني والسحابة",
          trainerLabel: "المدرب / المحاضر",
          trainerPlaceholder: "مثال: المهندس أحمد بن علي",
          dateLabel: "التاريخ والوقت",
          locationLabel: "المكان / القاعة",
          locationPlaceholder: "مثال: قاعة المحاضرات - المديرية العامة",
          descriptionLabel: "الوصف",
          descriptionPlaceholder: "تفاصيل وأهداف الدورة التدريبية...",
          submit: "إنشاء الدورة",
          submitting: "جاري الإنشاء...",
          cancel: "إلغاء"
        }
      },
      session: {
        backButton: "العودة إلى لوحة التحكم",
        detailsTitle: "تفاصيل الدورة",
        date: "التاريخ",
        trainer: "المدرب",
        location: "المكان",
        totalAttendees: "إجمالي المسجلين",
        presentCount: "الحاضرون",
        absentCount: "الغائبون",
        qrTitle: "رمز QR لتسجيل الحضور",
        qrSubtitle: "امسح هذا الرمز ضوئياً أو شارك الرابط لتسجيل الحضور",
        copyLink: "نسخ الرابط",
        linkCopied: "تم نسخ الرابط!",
        exportPdf: "تصدير بصيغة PDF",
        attendeesList: "سجل الحضور",
        emptyAttendees: "لم يتم تسجيل أي حضور حتى الآن.",
        columns: {
          name: "الاسم الكامل",
          email: "البريد الإلكتروني",
          phone: "رقم الهاتف",
          status: "الحالة",
          reason: "سبب الغياب",
          time: "وقت التسجيل"
        },
        statusPresent: "حاضر",
        statusAbsent: "غائب"
      },
      attend: {
        badge: "اتصالات الجزائر - تسجيل الحضور",
        title: "استمارة الإمارجمنت (تسجيل الحضور)",
        subtitle: "يرجى ملء النموذج لتأكيد حضورك للدورة",
        nameLabel: "الاسم واللقب",
        namePlaceholder: "مثال: كريم منصوري",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "مثال: karim.m@algerietelecom.dz",
        phoneLabel: "رقم الهاتف",
        phonePlaceholder: "مثال: 0661XX XX XX",
        statusLabel: "حالة الحضور",
        presentOption: "حاضر(ة)",
        absentOption: "غائب(ة)",
        reasonLabel: "سبب الغياب",
        reasonPlaceholder: "اذكر سبب الغياب...",
        submitButton: "تأكيد تسجيل الحضور",
        submitting: "جاري التسجيل...",
        successTitle: "تم تسجيل حضورك بنجاح!",
        successMessage: "شكراً لك. تم حفظ بيانات حضورك في النظام بنجاح.",
        alreadySubmittedTitle: "تم التسجيل سابقاً",
        alreadySubmittedMessage: "لقد قمت بتسجيل حضورك لهذه الدورة بالفعل."
      }
    }
  }
};

const setDocumentLanguage = (lng) => {
  const base = lng ? lng.split('-')[0] : lng;
  document.dir = base === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = base || 'fr';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      escapeValue: false // React handles XSS escaping automatically
    }
  })
  .then(() => {
    // apply direction/language on initial load
    setDocumentLanguage(i18n.language);
  });

// update on subsequent language changes
i18n.on('languageChanged', (lng) => {
  setDocumentLanguage(lng);
});

export default i18n;