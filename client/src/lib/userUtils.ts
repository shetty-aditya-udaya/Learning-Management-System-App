export const getDisplayName = (user: { email: string; name?: string } | null) => {
  if (!user) return "Guest";
  if (user.name) return user.name;
  
  // Get first part of email, capitalize first letter
  const emailName = user.email.split("@")[0];
  return emailName.charAt(0).toUpperCase() + emailName.slice(1);
};

export const getInitials = (user: { email: string; name?: string } | null) => {
  if (!user) return "GU";
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email.slice(0, 2).toUpperCase();
};
