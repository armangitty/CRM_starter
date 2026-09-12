export type UserRole =
  | "agency_owner"
  | "agency_admin"
  | "agency_staff"
  | "client_admin"
  | "client_user";

export type ContactStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "booked"
  | "customer"
  | "lost";

export type BookingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  client_account_id: string | null;
  role: UserRole;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type ClientAccount = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  industry: string | null;
  timezone: string;
  portal_enabled: boolean;
  booking_enabled: boolean;
  facebook_page_id: string | null;
  meta_ad_account_id: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  client_account_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  source_detail: Record<string, unknown>;
  status: ContactStatus;
  notes: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  client_account_id: string;
  calendar_id: string | null;
  contact_id: string | null;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  source: string;
  created_at: string;
  contacts?:
    | Pick<Contact, "first_name" | "last_name" | "email" | "phone">
    | Pick<Contact, "first_name" | "last_name" | "email" | "phone">[]
    | null;
}

export function bookingContact(booking: Pick<Booking, "contacts">) {
  const value = booking.contacts;
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function isAgencyRole(role: UserRole) {
  return (
    role === "agency_owner" ||
    role === "agency_admin" ||
    role === "agency_staff"
  );
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}
