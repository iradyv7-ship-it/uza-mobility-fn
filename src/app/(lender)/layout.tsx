export default function LenderGroupLayout({ children }: { children: React.ReactNode }) {
  // The guard and the shell both need the lender, which only the [lender] segment
  // knows. They are applied there rather than here.
  return children;
}
