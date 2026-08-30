export const authRoutes = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  checkEmail: '/check-email',
  googleCallback: '/auth/google/callback',
} as const;

export const workspaceRoutes = {
  account: '/my',
  accountOrders: '/my/orders',
  accountInvoices: '/my/invoices',
  accountBookings: '/my/bookings',
  accountPayments: '/my/payments',
  accountFinancing: '/my/financing',
  accountProfile: '/my/profile',
  accountNotifications: '/my/notifications',
  accountWishlist: '/my/wishlist',
  /** @deprecated Use accountProfile */
  accountSettings: '/my/profile',
  /** @deprecated Use accountBookings */
  accountBilling: '/my/bookings',
  seller: '/seller',
  sellerListings: '/seller/listings',
  sellerParts: '/seller/parts',
  sellerProfile: '/seller/profile',
  sellerNotifications: '/seller/notifications',
  operator: '/operator',
  operatorStations: '/operator/stations',
  operatorProfile: '/operator/profile',
  operatorNotifications: '/operator/notifications',
  /**
   * The institution portals. One path prefix, not one per bank — a bank is a row in
   * `config/lenders.ts`, so listing them here would be the code change that file exists
   * to avoid.
   */
  lender: '/lender',
  workshop: '/workshop',
} as const;

export const publicOnlyAuthPaths = [
  authRoutes.login,
  authRoutes.register,
  authRoutes.forgotPassword,
  authRoutes.checkEmail,
  authRoutes.googleCallback,
] as const;

export const protectedWorkspacePrefixes = [
  workspaceRoutes.account,
  workspaceRoutes.seller,
  workspaceRoutes.operator,
  workspaceRoutes.lender,
  workspaceRoutes.workshop,
] as const;
