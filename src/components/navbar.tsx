import NavbarClient from "./navbar-client";

export default function Navbar({ postModalId }: { postModalId: string }) {
  return <NavbarClient postModalId={postModalId} />;
}
