/**
 * Utility for formatting Patient Save / Edit errors into clear, role-guided Turkish messages.
 * Prevents raw technical messages ('Failed to fetch', 'TypeError', 500, undefined, stack traces)
 * from being displayed to end users, while logging full technical context to developer logs.
 */

export type FormattedErrorResult = {
  title: string;
  isValidationError: boolean;
  userMessage: string;
  missingFields?: Array<{
    field: string;
    responsibleRole?: string;
  }>;
  nextAction: string;
  technicalDetails?: string;
};

/**
 * Maps raw field keys or Turkish field labels to responsible doctor roles
 */
export function getResponsibleRoleForField(fieldLabel: string): string {
  const f = fieldLabel.toLowerCase();

  if (f.includes("kardiyolog") || f.includes("eko") || f.includes("lvh") || f.includes("ef ") || f.includes("ivs") || f.includes("pw") || f.includes("la")) {
    return "Kardiyoloji Uzmanı";
  }
  if (f.includes("hematoloji") || f.includes("immünfiksasyon") || f.includes("ife") || f.includes("hafif zincir") || f.includes("free light chain")) {
    return "Hematoloji Uzmanı";
  }
  if (f.includes("nükleer tıp") || f.includes("sintigrafi") || f.includes("scintigraphy")) {
    return "Nükleer Tıp Uzmanı";
  }
  if (f.includes("genetik") || f.includes("anomali")) {
    return "Genetik Uzmanı";
  }
  if (f.includes("nöroloji")) {
    return "Nöroloji Uzmanı";
  }
  return "İlgili Hekim";
}

/**
 * Standardizes any error during Patient Save / Edit operations
 */
export function formatPatientSaveError(error: any, contextInfo?: string): FormattedErrorResult {
  // Always log full raw error for developers
  console.error(`[Patient Save Error Log - ${contextInfo || "PatientEdit"}]`, error);

  let rawMsg = "";
  if (typeof error === "string") {
    rawMsg = error;
  } else if (error?.message) {
    rawMsg = String(error.message);
  } else if (error?.error?.message) {
    rawMsg = String(error.error.message);
  } else {
    rawMsg = JSON.stringify(error || "");
  }

  // 1) Catch network connection / fetch failure
  if (
    rawMsg.includes("Failed to fetch") ||
    rawMsg.includes("TypeError") ||
    rawMsg.includes("NetworkError") ||
    rawMsg.includes("Sunucuya bağlanılamadı")
  ) {
    return {
      title: "Sunucu Bağlantı Hatası",
      isValidationError: false,
      userMessage: "Hasta kaydı güncellenemedi. Sunucuya bağlanırken bir iletişim hatası oluştu.",
      nextAction: "Lütfen internet bağlantınızı ve sunucu erişiminizi kontrol edip tekrar deneyin.",
      technicalDetails: rawMsg,
    };
  }

  // 2) Catch missing primary cardiologist
  if (rawMsg.includes("Primary Cardiologist") || rawMsg.includes("primary_cardiologist") || rawMsg.includes("kardiyolog")) {
    return {
      title: "Eksik Zorunlu Bilgi",
      isValidationError: true,
      userMessage: "Hasta kaydının tamamlanabilmesi için birincil kardiyolog seçilmesi gerekmektedir.",
      missingFields: [
        { field: "Birincil Kardiyolog (Primary Cardiologist)", responsibleRole: "Kardiyoloji Uzmanı" }
      ],
      nextAction: "Lütfen birincil kardiyolog alanını doldurup tekrar kaydedin.",
    };
  }

  // 3) Duplicate Record Error (Email / Phone)
  if (rawMsg.includes("already exists") || rawMsg.includes("email")) {
    return {
      title: "Kayıt Güncellenemedi",
      isValidationError: true,
      userMessage: "Girilen e-posta adresine sahip başka bir kayıt bulunmaktadır.",
      nextAction: "Lütfen e-posta adresini kontrol edip tekrar deneyin.",
    };
  }

  if (rawMsg.includes("already has this phone") || rawMsg.includes("contactNumber")) {
    return {
      title: "Kayıt Güncellenemedi",
      isValidationError: true,
      userMessage: "Girilen telefon numarasına sahip başka bir kayıt bulunmaktadır.",
      nextAction: "Lütfen telefon numarasını kontrol edip tekrar deneyin.",
    };
  }

  // 4) 403 Forbidden / Authorization
  if (rawMsg.includes("Forbidden") || rawMsg.includes("yetki") || rawMsg.includes("403")) {
    return {
      title: "Yetki Sınırı",
      isValidationError: false,
      userMessage: "Bu alanda değişiklik yapma yetkiniz bulunmamaktadır.",
      nextAction: "Bu bilgi yalnızca yetkili uzman hekim tarafından güncellenebilir.",
      technicalDetails: rawMsg,
    };
  }

  // 5) Generic fallback for unexpected backend or validation errors
  return {
    title: "Hasta Kaydı Güncellenemedi",
    isValidationError: false,
    userMessage: "Kaydetme işlemi sırasında bir hata oluştu.",
    nextAction: "Lütfen doldurulan alanları kontrol edin. Sorun devam ederse sistem yöneticinizle iletişime geçin.",
    technicalDetails: rawMsg,
  };
}
