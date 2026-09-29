/**
 * Helper to parse contact information from Admin API dynamically.
 * Supports multiple phone numbers and multiple email addresses (comma, slash, newline, semicolon separated or arrays).
 * Zero hardcoded text fallback.
 */

export function parseContactInfo(contactInfo = []) {
  if (!Array.isArray(contactInfo)) {
    return {
      phones: [],
      emails: [],
      address: "",
      workingHours: "",
      whatsappPhone: "",
      rawItems: [],
    };
  }

  // 1. Phone numbers
  const phoneItems = contactInfo.filter((item) => {
    const l = (item?.label || "").toLowerCase();
    return (
      l.includes("phone") ||
      l.includes("mobile") ||
      l.includes("tel") ||
      l.includes("contact") ||
      l.includes("call")
    );
  });

  const phones = [];
  phoneItems.forEach((item) => {
    const val = item?.value;
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (typeof v === "string") {
          v.split(/[,/|\n;]/).forEach((p) => {
            const clean = p.trim();
            if (clean && !phones.includes(clean)) {
              phones.push(clean);
            }
          });
        }
      });
    } else if (typeof val === "string") {
      val.split(/[,/|\n;]/).forEach((p) => {
        const clean = p.trim();
        if (clean && !phones.includes(clean)) {
          phones.push(clean);
        }
      });
    }
  });

  // 2. Email addresses
  const emailItems = contactInfo.filter((item) => {
    const l = (item?.label || "").toLowerCase();
    return l.includes("email") || l.includes("mail");
  });

  const emails = [];
  emailItems.forEach((item) => {
    const val = item?.value;
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (typeof v === "string") {
          v.split(/[,/|\n;]/).forEach((e) => {
            const clean = e.trim();
            if (clean && !emails.includes(clean)) {
              emails.push(clean);
            }
          });
        }
      });
    } else if (typeof val === "string") {
      val.split(/[,/|\n;]/).forEach((e) => {
        const clean = e.trim();
        if (clean && !emails.includes(clean)) {
          emails.push(clean);
        }
      });
    }
  });

  // 3. Address
  const addressItem = contactInfo.find((item) => {
    const l = (item?.label || "").toLowerCase();
    return (
      l.includes("address") ||
      l.includes("office") ||
      l.includes("location") ||
      l.includes("headquarter")
    );
  });

  let address = "";
  if (addressItem) {
    if (Array.isArray(addressItem.value)) {
      address = addressItem.value.filter(Boolean).join(", ").trim();
    } else if (typeof addressItem.value === "string") {
      address = addressItem.value.trim();
    }
  }

  // 4. Working Hours
  const hoursItem = contactInfo.find((item) => {
    const l = (item?.label || "").toLowerCase();
    return (
      l.includes("hour") ||
      l.includes("time") ||
      l.includes("timing") ||
      l.includes("working")
    );
  });

  let workingHours = "";
  if (hoursItem) {
    if (Array.isArray(hoursItem.value)) {
      workingHours = hoursItem.value.filter(Boolean).join(", ").trim();
    } else if (typeof hoursItem.value === "string") {
      workingHours = hoursItem.value.trim();
    }
  }

  // 5. Clean WhatsApp phone (prefer 10 or 12 digit format)
  let whatsappPhone = "";
  if (phones.length > 0) {
    const digits = phones[0].replace(/\D/g, "");
    if (digits.length === 10) {
      whatsappPhone = `91${digits}`;
    } else if (digits.length > 10) {
      whatsappPhone = digits;
    }
  }

  return {
    phones,
    emails,
    address,
    workingHours,
    whatsappPhone,
    rawItems: contactInfo,
  };
}
